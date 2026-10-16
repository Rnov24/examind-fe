/**
 * EXAMIND - Primary Camera Edge CV & Heuristics Engine (PROC-001)
 * Philosophy: Ponytail - Standard Web APIs first (MediaDevices, Canvas, Visibility & Fullscreen APIs)
 */

export interface ProctoringCallbacks {
  onViolation: (eventType: string, severity: 'low' | 'medium' | 'high', snapshotBase64?: string) => void
  onCameraReady?: (stream: MediaStream) => void
  onStatusChange?: (status: { faceDetected: boolean; isFullscreen: boolean; active: boolean }) => void
}

export class ProctoringEdgeEngine {
  private videoElement: HTMLVideoElement | null = null
  private canvasElement: HTMLCanvasElement | null = null
  private stream: MediaStream | null = null
  private loopInterval: any = null
  private callbacks: ProctoringCallbacks
  private faceAbsentCounter = 0
  private isRunning = false

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

      this.bindSystemEvents()
      this.startInferenceLoop()
      this.isRunning = true

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

  private startInferenceLoop(): void {
    // Inference runs every 1 second (1 Hz) to preserve client CPU & battery
    this.loopInterval = setInterval(() => {
      this.processFrame()
    }, 1000)
  }

  private gazeAwayCounter = 0
  private cameraCoveredCounter = 0

  private processFrame(): void {
    if (!this.videoElement || this.videoElement.readyState < 2) return

    // Use native Shape Detection API (FaceDetector) if supported by browser
    const win = window as any
    if (win.FaceDetector) {
      try {
        const faceDetector = new win.FaceDetector({ fastMode: true, maxDetectedFaces: 3 })
        faceDetector.detect(this.videoElement).then((faces: any[]) => {
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
        }).catch(() => {
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
    // Lightweight canvas luma/activity check
    if (!this.videoElement || !this.canvasElement) return
    const width = 64
    const height = 48
    this.canvasElement.width = width
    this.canvasElement.height = height
    const ctx = this.canvasElement.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

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
    const avgLuma = totalLuma / totalPixels
    const halfPixels = totalPixels / 2
    const avgLeft = leftLuma / halfPixels
    const avgRight = rightLuma / halfPixels

    // Check if camera is covered or dark
    const isCovered = avgLuma < 12 || avgLuma > 252
    if (isCovered) {
      this.cameraCoveredCounter++
      if (this.cameraCoveredCounter === 5) {
        const snapshot = this.captureSnapshot()
        this.callbacks.onViolation('suspicious_object', 'high', snapshot)
      }
    } else {
      this.cameraCoveredCounter = 0
    }

    // Check head turned sideways (lum imbalance)
    const lumaDisparity = Math.abs(avgLeft - avgRight) / (avgLuma || 1)
    const gazeAway = lumaDisparity > 0.45

    const facePresent = !isCovered && avgLuma > 20 && avgLuma < 245
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
      const snapshot = this.captureSnapshot()
      this.callbacks.onViolation('multiple_faces', 'high', snapshot)
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

    if (this.callbacks.onStatusChange) {
      this.callbacks.onStatusChange({
        faceDetected: faceCount > 0,
        isFullscreen: !!document.fullscreenElement,
        active: this.isRunning,
      })
    }
  }

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
    if (this.loopInterval) {
      clearInterval(this.loopInterval)
      this.loopInterval = null
    }

    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange)

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop())
      this.stream = null
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null
    }
  }
}
