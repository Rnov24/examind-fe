/**
 * EXAMIND - Secondary Mobile Companion Edge CV & Sensor Engine
 * Runs 100% on the client-side (mobile browser) using Canvas, ImageData,
 * DeviceOrientation / DeviceMotion APIs, plus MediaPipe Tasks Vision
 * object detection (EfficientDet-Lite0) for person / phone / extra-screen
 * signals from the side/desk view.
 * Zero server-side video streaming required.
 *
 * MediaPipe is a strictly additive layer: when it cannot load on the
 * device, the heuristic engine (motion / glare / orientation / occlusion)
 * keeps running on its own so the exam is never left unmonitored.
 */

import { detectObjects, ensureMediaPipeLoaded } from './mediapipeDetect'

export interface CompanionTelemetry {
  motionLevel: number       // 0 - 100%
  stabilityScore: number    // 0 - 100% (phone still on desk)
  lightLevel: number        // 0 - 255
  deskDetected: boolean     // Camera positioned towards desk
  phonePickedUp: boolean    // Gyroscope/Accelerometer flag
  fps: number
  /** True when the MediaPipe detection layer is live on this device. */
  detectionActive?: boolean
  /** Latest MediaPipe result: a person is visible from the side view. */
  personDetected?: boolean
  /** Latest MediaPipe result: number of visible persons (score >= 0.5). */
  personCount?: number
  /** Latest MediaPipe result: a cell phone is visible in the desk area. */
  phoneDetected?: boolean
}

export interface CompanionCallbacks {
  onViolation: (eventType: string, severity: 'low' | 'medium' | 'high', snapshotBase64?: string, details?: string) => void
  onFrame: (snapshotBase64: string, telemetry: CompanionTelemetry) => void
  onTelemetry: (telemetry: CompanionTelemetry) => void
  onCameraReady?: (stream: MediaStream) => void
}

export class CompanionEdgeEngine {
  private videoElement: HTMLVideoElement | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private stream: MediaStream | null = null
  private processInterval: any = null
  private callbacks: CompanionCallbacks

  // State & Sensors
  private prevFrameData: Uint8ClampedArray | null = null
  private isRunning: boolean = false
  private baselineOrientation: { alpha: number; beta: number; gamma: number } | null = null
  private currentOrientation: { alpha: number; beta: number; gamma: number } = { alpha: 0, beta: 0, gamma: 0 }
  private currentAccel: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }
  private phoneMovedCounter: number = 0
  private occlusionCounter: number = 0
  private secondaryDeviceCounter: number = 0
  private excessiveMotionCounter: number = 0

  // MediaPipe object-detection layer (additive; heuristics keep running
  // regardless of whether this layer is active)
  private detectionInterval: any = null
  private detectionActive: boolean = false
  private detectionBusy: boolean = false
  private lastPersonCount: number = 0
  private lastPhoneDetected: boolean = false
  private absentSince: number | null = null
  private absentFired: boolean = false
  private multiPersonStreak: number = 0
  private multiPersonFired: boolean = false
  private phoneStreak: number = 0
  private phoneFired: boolean = false
  private extraScreenStreak: number = 0
  private extraScreenFired: boolean = false

  private readonly DETECTION_INTERVAL_MS = 1500
  private readonly ABSENT_THRESHOLD_MS = 10000

  private readonly ANALYSIS_WIDTH = 120
  private readonly ANALYSIS_HEIGHT = 90
  private frameCount = 0
  private lastFpsTimestamp = Date.now()
  private currentFps = 0

  constructor(callbacks: CompanionCallbacks) {
    this.callbacks = callbacks
  }

  public async start(videoEl?: HTMLVideoElement, facingMode: 'environment' | 'user' = 'environment'): Promise<MediaStream> {
    if (videoEl) {
      this.videoElement = videoEl
    } else {
      this.videoElement = document.createElement('video')
      this.videoElement.autoplay = true
      this.videoElement.muted = true
      this.videoElement.playsInline = true
    }

    this.canvasElement = document.createElement('canvas')
    this.canvasElement.width = this.ANALYSIS_WIDTH
    this.canvasElement.height = this.ANALYSIS_HEIGHT

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 15 },
        },
        audio: false,
      })

      this.videoElement.srcObject = this.stream
      await this.videoElement.play().catch(() => {})

      if (this.callbacks.onCameraReady) {
        this.callbacks.onCameraReady(this.stream)
      }

      this.initSensors()
      this.startEdgeProcessingLoop()
      this.isRunning = true
      void this.startDetectionLoop()

      return this.stream
    } catch (err) {
      console.warn('[CompanionEdge] Camera access error:', err)
      this.callbacks.onViolation('camera_error', 'high', undefined, 'Kamera sekunder tidak dapat diakses')
      throw err
    }
  }

  private initSensors(): void {
    // Gyroscope & Orientation tracking
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', this.handleOrientation, true)
    }

    // Accelerometer tracking
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      window.addEventListener('devicemotion', this.handleMotion, true)
    }
  }

  private handleOrientation = (e: DeviceOrientationEvent): void => {
    const alpha = e.alpha || 0
    const beta = e.beta || 0
    const gamma = e.gamma || 0

    this.currentOrientation = { alpha, beta, gamma }

    // Calibrate initial resting position
    if (!this.baselineOrientation) {
      this.baselineOrientation = { alpha, beta, gamma }
    }
  }

  private handleMotion = (e: DeviceMotionEvent): void => {
    if (e.accelerationIncludingGravity) {
      this.currentAccel = {
        x: e.accelerationIncludingGravity.x || 0,
        y: e.accelerationIncludingGravity.y || 0,
        z: e.accelerationIncludingGravity.z || 0,
      }
    }
  }

  public recalibrateOrientation(): void {
    this.baselineOrientation = { ...this.currentOrientation }
  }

  public recalibrate(): void {
    this.recalibrateOrientation()
  }

  private startEdgeProcessingLoop(): void {
    // Edge CV loop runs at 2.5 Hz (every 400ms) - extremely lightweight for mobile CPU & battery
    let tickCount = 0
    this.processInterval = setInterval(() => {
      tickCount++
      this.processFrame(tickCount)
    }, 400)
  }

  /**
   * MediaPipe object-detection loop (~1 detection / 1.5s). Loads lazily;
   * when MediaPipe is unavailable on this device the loop simply never
   * starts and the heuristic engine below remains the only monitor.
   */
  private async startDetectionLoop(): Promise<void> {
    const ready = await ensureMediaPipeLoaded()
    if (!ready || !this.isRunning) {
      this.detectionActive = false
      return
    }
    this.detectionActive = true
    void this.runDetection()
    this.detectionInterval = setInterval(() => {
      void this.runDetection()
    }, this.DETECTION_INTERVAL_MS)
  }

  private async runDetection(): Promise<void> {
    if (!this.isRunning || this.detectionBusy) return
    if (!this.videoElement || this.videoElement.readyState < 2 || !this.videoElement.videoWidth) return

    this.detectionBusy = true
    try {
      const result = await detectObjects(this.videoElement, performance.now())
      if (!result || !this.isRunning) return

      this.lastPersonCount = result.personCount
      this.lastPhoneDetected = result.phoneDetected
      this.evaluateDetectionAnomalies(result)
    } finally {
      this.detectionBusy = false
    }
  }

  private evaluateDetectionAnomalies(result: {
    personCount: number
    phoneDetected: boolean
    objects: { label: string; score: number }[]
  }): void {
    const now = Date.now()

    // 1. Student absent from the desk (side view) for > 10s sustained.
    // One violation per absence episode; re-arms when a person returns.
    if (result.personCount === 0) {
      if (this.absentSince === null) {
        this.absentSince = now
      } else if (now - this.absentSince > this.ABSENT_THRESHOLD_MS && !this.absentFired) {
        this.absentFired = true
        const snap = this.captureSnapshot()
        this.callbacks.onViolation(
          'face_absent',
          'high',
          snap,
          'Siswa tidak terlihat dari kamera samping selama lebih dari 10 detik'
        )
      }
    } else {
      this.absentSince = null
      this.absentFired = false
    }

    // 2. A second person in the desk area (2 consecutive detections).
    if (result.personCount >= 2) {
      this.multiPersonStreak++
      if (this.multiPersonStreak >= 2 && !this.multiPersonFired) {
        this.multiPersonFired = true
        const snap = this.captureSnapshot()
        this.callbacks.onViolation(
          'multiple_faces',
          'high',
          snap,
          'Terdeteksi lebih dari satu orang di area meja dari kamera samping'
        )
      }
    } else {
      this.multiPersonStreak = 0
      this.multiPersonFired = false
    }

    // 3. A cell phone visible in hand / on the desk from the side view
    // (2 consecutive detections to suppress single-frame flicker).
    if (result.phoneDetected) {
      this.phoneStreak++
      if (this.phoneStreak >= 2 && !this.phoneFired) {
        this.phoneFired = true
        const snap = this.captureSnapshot()
        this.callbacks.onViolation(
          'phone_detected',
          'high',
          snap,
          'HP terdeteksi di area meja dari kamera samping'
        )
      }
    } else {
      this.phoneStreak = 0
      this.phoneFired = false
    }

    // 4. An extra screen / monitor: one laptop in frame is the student's
    // own exam device and is expected; two or more screens are not.
    const screenCount = result.objects.filter(
      (o) => (o.label === 'laptop' || o.label === 'tv') && o.score >= 0.5
    ).length
    if (screenCount >= 2) {
      this.extraScreenStreak++
      if (this.extraScreenStreak >= 2 && !this.extraScreenFired) {
        this.extraScreenFired = true
        const snap = this.captureSnapshot()
        this.callbacks.onViolation(
          'suspicious_object',
          'medium',
          snap,
          'Terdeteksi layar atau monitor tambahan di area meja kerja'
        )
      }
    } else {
      this.extraScreenStreak = 0
      this.extraScreenFired = false
    }
  }

  private processFrame(tickCount: number): void {
    if (!this.videoElement || this.videoElement.readyState < 2 || !this.canvasElement) return

    const ctx = this.canvasElement.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    ctx.drawImage(this.videoElement, 0, 0, this.ANALYSIS_WIDTH, this.ANALYSIS_HEIGHT)
    const imgData = ctx.getImageData(0, 0, this.ANALYSIS_WIDTH, this.ANALYSIS_HEIGHT)
    const data = imgData.data

    // 1. Motion Vector Calculation (Temporal Difference)
    let totalDiff = 0
    let totalLuma = 0
    let highIntensityClusters = 0

    if (this.prevFrameData) {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const luma = 0.299 * r + 0.587 * g + 0.114 * b
        totalLuma += luma

        const prevLuma = 0.299 * this.prevFrameData[i] + 0.587 * this.prevFrameData[i + 1] + 0.114 * this.prevFrameData[i + 2]
        const diff = Math.abs(luma - prevLuma)
        if (diff > 25) {
          totalDiff += diff
        }

        // Secondary phone screen glare detection (specular bright rectangular regions)
        if (luma > 240 && r > 200 && g > 200 && b > 200) {
          highIntensityClusters++
        }
      }
    } else {
      this.prevFrameData = new Uint8ClampedArray(data.length)
    }
    this.prevFrameData.set(data)

    const numPixels = this.ANALYSIS_WIDTH * this.ANALYSIS_HEIGHT
    const avgLuma = totalLuma / numPixels
    const motionPercent = Math.min(100, Math.round((totalDiff / (numPixels * 255)) * 1000))

    // 2. Physical Smartphone Movement & Tilt Verification (Sensor Fusion)
    let isPhoneMoved = false
    let stability = 100

    if (this.baselineOrientation) {
      const deltaBeta = Math.abs(this.currentOrientation.beta - this.baselineOrientation.beta)
      const deltaGamma = Math.abs(this.currentOrientation.gamma - this.baselineOrientation.gamma)
      const totalAngularShift = deltaBeta + deltaGamma

      if (totalAngularShift > 25) {
        isPhoneMoved = true
        stability = Math.max(0, 100 - Math.round(totalAngularShift * 2))
      } else {
        stability = Math.max(20, 100 - Math.round(totalAngularShift * 1.5))
      }
    }

    // 3. Occlusion & Dark Screen Detection
    const isOccluded = avgLuma < 12 || avgLuma > 252

    // 4. Secondary Device Glare Detection (> 1.5% of pixels are pure saturated screen glare)
    const hasScreenGlare = (highIntensityClusters / numPixels) > 0.025

    // Evaluate Violations
    this.evaluateEdgeAnomalies({
      isOccluded,
      isPhoneMoved,
      hasScreenGlare,
      motionPercent,
      avgLuma,
      stability,
    })

    // FPS calculation
    this.frameCount++
    const now = Date.now()
    if (now - this.lastFpsTimestamp >= 1000) {
      this.currentFps = this.frameCount
      this.frameCount = 0
      this.lastFpsTimestamp = now
    }

    const telemetry: CompanionTelemetry = {
      motionLevel: motionPercent,
      stabilityScore: stability,
      lightLevel: Math.round(avgLuma),
      deskDetected: !isOccluded && avgLuma > 25,
      phonePickedUp: isPhoneMoved,
      fps: this.currentFps || 3,
      detectionActive: this.detectionActive,
      ...(this.detectionActive
        ? {
            personDetected: this.lastPersonCount > 0,
            personCount: this.lastPersonCount,
            phoneDetected: this.lastPhoneDetected,
          }
        : {}),
    }

    this.callbacks.onTelemetry(telemetry)

    // Emit live preview thumbnail every ~2 seconds (every 5 ticks) to preserve bandwidth
    if (tickCount % 5 === 0) {
      const snapshot = this.captureSnapshot(320, 240, 0.45)
      if (snapshot) {
        this.callbacks.onFrame(snapshot, telemetry)
      }
    }
  }

  private evaluateEdgeAnomalies(metrics: {
    isOccluded: boolean
    isPhoneMoved: boolean
    hasScreenGlare: boolean
    motionPercent: number
    avgLuma: number
    stability: number
  }): void {
    // 1. Phone picked up or moved during exam
    if (metrics.isPhoneMoved) {
      this.phoneMovedCounter++
      if (this.phoneMovedCounter === 3) {
        // Flag after ~1.2 seconds of displacement
        const snap = this.captureSnapshot()
        this.callbacks.onViolation(
          'suspicious_object',
          'high',
          snap,
          'Smartphone kamera sekunder dipindahkan atau diangkat dari meja'
        )
      }
    } else {
      this.phoneMovedCounter = 0
    }

    // 2. Camera occluded or fallen
    if (metrics.isOccluded) {
      this.occlusionCounter++
      if (this.occlusionCounter === 5) {
        const snap = this.captureSnapshot()
        this.callbacks.onViolation(
          'suspicious_object',
          'high',
          snap,
          'Kamera sekunder tertutup atau jatuh dari posisi pantau meja'
        )
      }
    } else {
      this.occlusionCounter = 0
    }

    // 3. Secondary device screen glare on desk
    if (metrics.hasScreenGlare) {
      this.secondaryDeviceCounter++
      if (this.secondaryDeviceCounter === 4) {
        const snap = this.captureSnapshot()
        this.callbacks.onViolation(
          'suspicious_object',
          'medium',
          snap,
          'Deteksi layar gawai sekunder aktif / pantulan layar di atas meja kerja'
        )
      }
    } else {
      this.secondaryDeviceCounter = 0
    }

    // 4. Excessive chaotic desk motion
    if (metrics.motionPercent > 65) {
      this.excessiveMotionCounter++
      if (this.excessiveMotionCounter === 4) {
        const snap = this.captureSnapshot()
        this.callbacks.onViolation(
          'suspicious_object',
          'medium',
          snap,
          'Aktivitas gerakan mencurigakan di area meja kerja pengerjaan'
        )
      }
    } else {
      this.excessiveMotionCounter = 0
    }
  }

  public captureSnapshot(width = 360, height = 270, quality = 0.55): string | undefined {
    if (!this.videoElement || !this.videoElement.videoWidth) return undefined

    const snapCanvas = document.createElement('canvas')
    snapCanvas.width = width
    snapCanvas.height = height
    const ctx = snapCanvas.getContext('2d')
    if (!ctx) return undefined

    ctx.drawImage(this.videoElement, 0, 0, width, height)
    return snapCanvas.toDataURL('image/jpeg', quality)
  }

  public stop(): void {
    this.isRunning = false
    if (this.processInterval) {
      clearInterval(this.processInterval)
      this.processInterval = null
    }

    if (this.detectionInterval) {
      clearInterval(this.detectionInterval)
      this.detectionInterval = null
    }
    this.detectionActive = false
    this.absentSince = null
    this.absentFired = false

    if (typeof window !== 'undefined') {
      window.removeEventListener('deviceorientation', this.handleOrientation, true)
      window.removeEventListener('devicemotion', this.handleMotion, true)
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
    }
  }
}
