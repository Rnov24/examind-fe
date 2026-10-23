/**
 * EXAMIND - Primary Camera Edge CV Engine (PROC-001, v2)
 *
 * Primary path: MediaPipe Tasks Vision (BlazeFace + EfficientDet-Lite0),
 * loaded lazily and self-hosted — see src/utils/mediapipeDetect.ts.
 * Fallback path: the original native FaceDetector / luma-heuristic logic,
 * used while MediaPipe loads and whenever it is unavailable, so the exam
 * is never blocked by an ML failure.
 *
 * Public interface (constructor callbacks, start/stop/captureSnapshot) is
 * unchanged from v1; the status payload only gained `phoneDetected`.
 */

import {
  closeMediaPipeDetectors,
  detectFaces,
  detectObjects,
  ensureMediaPipeLoaded,
} from './mediapipeDetect'

export interface ProctoringCallbacks {
  onViolation: (eventType: string, severity: 'low' | 'medium' | 'high', snapshotBase64?: string) => void
  onCameraReady?: (stream: MediaStream) => void
  onStatusChange?: (status: {
    faceDetected: boolean
    isFullscreen: boolean
    active: boolean
    phoneDetected: boolean
  }) => void
}

// Violation timing (ms) — face/gaze thresholds mirror the v1 counters
// (8 ticks and 6 ticks at the old 1 Hz cadence).
const FACE_ABSENT_THRESHOLD_MS = 8000
const GAZE_AWAY_THRESHOLD_MS = 6000
const MULTIPLE_FACES_THROTTLE_MS = 10000
const PHONE_VIOLATION_THROTTLE_MS = 10000

export class ProctoringEdgeEngine {
  private videoElement: HTMLVideoElement | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private analysisCanvas: HTMLCanvasElement | null = null
  private stream: MediaStream | null = null
  private legacyLoopInterval: any = null
  private faceLoopInterval: any = null
  private objectLoopInterval: any = null
  private callbacks: ProctoringCallbacks
  private isRunning = false
  private useMediaPipe = false

  // Legacy-path counters (1 Hz cadence semantics, unchanged from v1)
  private faceAbsentCounter = 0
  private gazeAwayCounter = 0
  private cameraCoveredCounter = 0

  // MediaPipe-path episode tracking (timestamps, ms)
  private faceAbsentSince: number | null = null
  private faceAbsentFired = false
  private gazeAwaySince: number | null = null
  private gazeAwayFired = false

  // Shared violation throttles / latest object-loop state
  private lastMultipleFacesAt = 0
  private lastPhoneViolationAt = 0
  private latestPhoneDetected = false
  private faceTickInFlight = false
  private objectTickInFlight = false

  constructor(callbacks: ProctoringCallbacks) {
    this.callbacks = callbacks
  }

  public async start(videoEl?: HTMLVideoElement): Promise<MediaStream> {
    if (videoEl) {
      this.videoElement = videoEl
    } else {
      this.videoElement = document.createElement('video')
      this.videoElement.autoplay = true
      this.videoElement.muted = true
      this.videoElement.playsInline = true
    }

    this.canvasElement = document.createElement('canvas')
    this.analysisCanvas = document.createElement('canvas')

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, frameRate: { ideal: 15 } },
        audio: false,
      })
      this.videoElement.srcObject = this.stream
      await this.videoElement.play().catch(() => {})

      if (this.callbacks.onCameraReady) {
        this.callbacks.onCameraReady(this.stream)
      }

      this.isRunning = true
      this.bindSystemEvents()

      // Legacy loop starts immediately so proctoring is active while the
      // MediaPipe runtime + models download, and stays as the permanent
      // path if MediaPipe fails to load.
      this.startLegacyLoop()
      ensureMediaPipeLoaded().then((ready) => {
        if (ready && this.isRunning) {
          this.useMediaPipe = true
          this.stopLegacyLoop()
          this.resetViolationState()
          this.startMediaPipeLoops()
        }
      })

      return this.stream
    } catch (err) {
      console.warn('[ProctoringEdge] Camera access error:', err)
      this.callbacks.onViolation('camera_error', 'high')
      throw err
    }
  }

  public captureSnapshot(): string | undefined {
    if (!this.videoElement || !this.canvasElement || !this.videoElement.videoWidth) {
      return undefined
    }
    const width = this.videoElement.videoWidth || 320
    const height = this.videoElement.videoHeight || 240
    this.canvasElement.width = width
    this.canvasElement.height = height

    const ctx = this.canvasElement.getContext('2d')
    if (!ctx) return undefined

    ctx.drawImage(this.videoElement, 0, 0, width, height)
    return this.canvasElement.toDataURL('image/jpeg', 0.6)
  }

  // ------------------------------------------------------------------
  // Shared helpers
  // ------------------------------------------------------------------

  private emitStatus(faceDetected: boolean): void {
    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange({
        faceDetected,
        isFullscreen: !!document.fullscreenElement,
        active: this.isRunning,
        phoneDetected: this.latestPhoneDetected,
      })
    }
  }

  private fireMultipleFaces(now: number): void {
    // At most one multiple_faces violation per throttle window, no matter
    // which detector (faces or object person count) raised the signal.
    if (now - this.lastMultipleFacesAt < MULTIPLE_FACES_THROTTLE_MS) return
    this.lastMultipleFacesAt = now
    const snapshot = this.captureSnapshot()
    this.callbacks.onViolation('multiple_faces', 'high', snapshot)
  }

  private resetViolationState(): void {
    this.faceAbsentCounter = 0
    this.gazeAwayCounter = 0
    this.cameraCoveredCounter = 0
    this.faceAbsentSince = null
    this.faceAbsentFired = false
    this.gazeAwaySince = null
    this.gazeAwayFired = false
  }

  /**
   * Downscaled luma stats shared by the camera-covered check (both paths)
   * and the legacy heuristic. Returns null when no frame can be read.
   */
  private computeLumaStats(): { avgLuma: number; avgLeft: number; avgRight: number } | null {
    if (!this.videoElement || !this.analysisCanvas) return null
    const width = 64
    const height = 48
    this.analysisCanvas.width = width
    this.analysisCanvas.height = height
    const ctx = this.analysisCanvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return null

    ctx.drawImage(this.videoElement, 0, 0, width, height)
    const imgData = ctx.getImageData(0, 0, width, height)
    const data = imgData.data

    let leftLuma = 0
    let rightLuma = 0
    let totalLuma = 0
    const halfWidth = width / 2

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
        totalLuma += luma
        if (x < halfWidth) {
          leftLuma += luma
        } else {
          rightLuma += luma
        }
      }
    }

    const totalPixels = width * height
    const halfPixels = totalPixels / 2
    return {
      avgLuma: totalLuma / totalPixels,
      avgLeft: leftLuma / halfPixels,
      avgRight: rightLuma / halfPixels,
    }
  }

  /**
   * Camera-covered check (near-black or blown-out frame sustained for
   * ~5 ticks of the active loop) — behavior preserved from v1.
   */
  private updateCameraCovered(stats: { avgLuma: number }): void {
    const isCovered = stats.avgLuma < 12 || stats.avgLuma > 252
    if (isCovered) {
      this.cameraCoveredCounter++
      // 5 ticks at the legacy 1 Hz cadence, 10 ticks at the 2 Hz face loop
      const threshold = this.useMediaPipe ? 10 : 5
      if (this.cameraCoveredCounter === threshold) {
        const snapshot = this.captureSnapshot()
        this.callbacks.onViolation('suspicious_object', 'high', snapshot)
      }
    } else {
      this.cameraCoveredCounter = 0
    }
  }

  // ------------------------------------------------------------------
  // MediaPipe path (face loop 500 ms, object loop 1500 ms)
  // ------------------------------------------------------------------

  private startMediaPipeLoops(): void {
    this.faceLoopInterval = setInterval(() => {
      void this.processFaceFrame()
    }, 500)
    this.objectLoopInterval = setInterval(() => {
      void this.processObjectFrame()
    }, 1500)
  }

  private videoReady(): boolean {
    return (
      !!this.videoElement &&
      this.videoElement.readyState >= 2 &&
      this.videoElement.videoWidth > 0 &&
      !document.hidden
    )
  }

  private async processFaceFrame(): Promise<void> {
    if (!this.isRunning || this.faceTickInFlight || !this.videoReady()) return
    this.faceTickInFlight = true
    try {
      const now = performance.now()
      const result = await detectFaces(this.videoElement!, now)
      if (!result) {
        // MediaPipe hiccup on this frame — run one legacy pass instead of
        // leaving the student unmonitored.
        this.processFrame()
        return
      }

      const stats = this.computeLumaStats()
      if (stats) this.updateCameraCovered(stats)

      const faceCount = result.faces.length

      if (faceCount === 0) {
        if (this.faceAbsentSince === null) {
          this.faceAbsentSince = now
          this.faceAbsentFired = false
        } else if (!this.faceAbsentFired && now - this.faceAbsentSince >= FACE_ABSENT_THRESHOLD_MS) {
          this.faceAbsentFired = true
          const snapshot = this.captureSnapshot()
          this.callbacks.onViolation('face_absent', 'high', snapshot)
        }
      } else {
        this.faceAbsentSince = null
        this.faceAbsentFired = false
      }

      if (faceCount >= 2) {
        this.fireMultipleFaces(now)
      }

      if (faceCount === 1 && result.faces[0].gazeAway) {
        if (this.gazeAwaySince === null) {
          this.gazeAwaySince = now
          this.gazeAwayFired = false
        } else if (!this.gazeAwayFired && now - this.gazeAwaySince >= GAZE_AWAY_THRESHOLD_MS) {
          this.gazeAwayFired = true
          const snapshot = this.captureSnapshot()
          this.callbacks.onViolation('gaze_away', 'medium', snapshot)
        }
      } else {
        this.gazeAwaySince = null
        this.gazeAwayFired = false
      }

      this.emitStatus(faceCount > 0)
    } finally {
      this.faceTickInFlight = false
    }
  }

  private async processObjectFrame(): Promise<void> {
    if (!this.isRunning || this.objectTickInFlight || !this.videoReady()) return
    this.objectTickInFlight = true
    try {
      const now = performance.now()
      const result = await detectObjects(this.videoElement!, now)
      if (!result) return

      this.latestPhoneDetected = result.phoneDetected

      if (result.phoneDetected && now - this.lastPhoneViolationAt >= PHONE_VIOLATION_THROTTLE_MS) {
        this.lastPhoneViolationAt = now
        const snapshot = this.captureSnapshot()
        // 'phone_detected' is a first-class backend event type since the
        // add_phone_detected_event migration (deduction 20, same as
        // suspicious_object, but teachers see exactly what was detected).
        this.callbacks.onViolation('phone_detected', 'high', snapshot)
      }

      // Secondary multiple-person signal from the object detector.
      if (result.personCount >= 2) {
        this.fireMultipleFaces(now)
      }
    } finally {
      this.objectTickInFlight = false
    }
  }

  // ------------------------------------------------------------------
  // Legacy fallback path (native FaceDetector / luma heuristic, v1)
  // ------------------------------------------------------------------

  private startLegacyLoop(): void {
    // Inference runs every 1 second (1 Hz) to preserve client CPU & battery
    this.legacyLoopInterval = setInterval(() => {
      this.processFrame()
    }, 1000)
  }

  private stopLegacyLoop(): void {
    if (this.legacyLoopInterval) {
      clearInterval(this.legacyLoopInterval)
      this.legacyLoopInterval = null
    }
  }

  private processFrame(): void {
    if (!this.videoElement || this.videoElement.readyState < 2) return

    // Use native Shape Detection API (FaceDetector) if supported by browser
    const win = window as any
    if (win.FaceDetector) {
      try {
        const faceDetector = new win.FaceDetector({ fastMode: true, maxDetectedFaces: 3 })
        faceDetector
          .detect(this.videoElement)
          .then((faces: any[]) => {
            let gazeAway = false
            if (faces.length === 1 && this.videoElement?.videoWidth) {
              const box = faces[0].boundingBox
              const centerX = box.x + box.width / 2
              const videoCenterX = this.videoElement.videoWidth / 2
              const offsetRatio = Math.abs(centerX - videoCenterX) / this.videoElement.videoWidth
              if (offsetRatio > 0.32) {
                gazeAway = true
              }
            }
            this.evaluateDetections(faces.length, gazeAway)
          })
          .catch(() => {
            this.fallbackHeuristic()
          })
        return
      } catch {
        // Fallback
      }
    }

    this.fallbackHeuristic()
  }

  private fallbackHeuristic(): void {
    const stats = this.computeLumaStats()
    if (!stats) return

    this.updateCameraCovered(stats)
    const isCovered = stats.avgLuma < 12 || stats.avgLuma > 252

    // Check head turned sideways (luma imbalance)
    const lumaDisparity = Math.abs(stats.avgLeft - stats.avgRight) / (stats.avgLuma || 1)
    const gazeAway = lumaDisparity > 0.45

    const facePresent = !isCovered && stats.avgLuma > 20 && stats.avgLuma < 245
    this.evaluateDetections(facePresent ? 1 : 0, gazeAway)
  }

  private evaluateDetections(faceCount: number, gazeAway: boolean = false): void {
    if (faceCount === 0) {
      this.faceAbsentCounter++
      // If absent for > 8 seconds, trigger violation
      if (this.faceAbsentCounter === 8) {
        const snapshot = this.captureSnapshot()
        this.callbacks.onViolation('face_absent', 'high', snapshot)
      }
    } else {
      this.faceAbsentCounter = 0
    }

    if (faceCount >= 2) {
      this.fireMultipleFaces(Date.now())
    }

    if (gazeAway && faceCount === 1) {
      this.gazeAwayCounter++
      if (this.gazeAwayCounter === 6) {
        const snapshot = this.captureSnapshot()
        this.callbacks.onViolation('gaze_away', 'medium', snapshot)
      }
    } else {
      this.gazeAwayCounter = 0
    }

    this.emitStatus(faceCount > 0)
  }

  // ------------------------------------------------------------------
  // System events & lifecycle
  // ------------------------------------------------------------------

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      const snapshot = this.captureSnapshot()
      this.callbacks.onViolation('tab_switch', 'medium', snapshot)
    }
  }

  private handleFullscreenChange = (): void => {
    if (!document.fullscreenElement) {
      const snapshot = this.captureSnapshot()
      this.callbacks.onViolation('fullscreen_exit', 'medium', snapshot)
    }
  }

  private bindSystemEvents(): void {
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    document.addEventListener('fullscreenchange', this.handleFullscreenChange)
  }

  public stop(): void {
    this.isRunning = false
    this.useMediaPipe = false
    this.stopLegacyLoop()
    if (this.faceLoopInterval) {
      clearInterval(this.faceLoopInterval)
      this.faceLoopInterval = null
    }
    if (this.objectLoopInterval) {
      clearInterval(this.objectLoopInterval)
      this.objectLoopInterval = null
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange)

    // Release the WASM detectors so a later exam start reloads them cleanly.
    closeMediaPipeDetectors()

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
    }

    this.resetViolationState()
    this.latestPhoneDetected = false
  }
}
