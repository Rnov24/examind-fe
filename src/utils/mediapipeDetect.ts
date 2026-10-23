/**
 * EXAMIND - MediaPipe Tasks Vision detection layer (proctoring engine v2)
 *
 * Lazy singleton wrapper around @mediapipe/tasks-vision:
 *  - BlazeFace (short range) face detection with keypoints, VIDEO mode
 *  - EfficientDet-Lite0 object detection (cell phone / person), VIDEO mode
 *
 * Assets are self-hosted (no CDN at runtime):
 *  - WASM fileset:  /mediapipe/wasm/
 *  - Models:        /models/blaze_face_short_range.task
 *                   /models/efficientdet_lite0.task
 *
 * The library is loaded via dynamic import only when proctoring starts, so
 * none of this is in the critical path of the exam page. Every public
 * function is failure-tolerant: when MediaPipe cannot load or a frame fails,
 * the functions return null and the caller falls back to the legacy
 * native FaceDetector / luma-heuristic path instead of breaking the exam.
 */

import type {
  FaceDetector as FaceDetectorInstance,
  ObjectDetector as ObjectDetectorInstance,
} from '@mediapipe/tasks-vision'

export interface NormalizedBoundingBox {
  originX: number
  originY: number
  width: number
  height: number
}

export interface NormalizedFace {
  /** Detection confidence of the top category (0..1). */
  score: number
  /** Bounding box in frame pixels, null when the model returned none. */
  boundingBox: NormalizedBoundingBox | null
  /** BlazeFace keypoints in normalized image coordinates (0..1). */
  keypoints: { x: number; y: number }[]
  /**
   * Head-pose proxy: true when the nose keypoint sits far off the eye line
   * (head turned) or the face box is pushed far from the frame center.
   */
  gazeAway: boolean
}

export interface FaceFrameResult {
  faces: NormalizedFace[]
}

export interface NormalizedObject {
  label: string
  score: number
  boundingBox: NormalizedBoundingBox | null
}

export interface ObjectFrameResult {
  objects: NormalizedObject[]
  /** Any 'cell phone' detection with score >= 0.5. */
  phoneDetected: boolean
  /** Number of 'person' detections with score >= 0.5. */
  personCount: number
}

const WASM_PATH = '/mediapipe/wasm'
const FACE_MODEL_PATH = '/models/blaze_face_short_range.task'
const OBJECT_MODEL_PATH = '/models/efficientdet_lite0.task'
const PHONE_LABEL = 'cell phone'
const PERSON_LABEL = 'person'
const OBJECT_FLAG_MIN_SCORE = 0.5

let faceDetector: FaceDetectorInstance | null = null
let objectDetector: ObjectDetectorInstance | null = null
let loadPromise: Promise<boolean> | null = null
let loadFailed = false
let lastFaceTimestamp = -1
let lastObjectTimestamp = -1
let detectErrorWarned = false

/**
 * BlazeFace keypoint order: 0 right eye, 1 left eye, 2 nose tip,
 * 3 mouth center, 4 right ear, 5 left ear (normalized coordinates).
 * Facing the camera, the nose sits roughly midway between the eyes; when the
 * head yaws, the nose drifts toward one eye. A nose offset beyond ~45% of
 * the inter-eye distance means the head is clearly turned away.
 */
function computeGazeAway(
  keypoints: { x: number; y: number }[],
  boundingBox: NormalizedBoundingBox | null,
  frameWidth: number,
): boolean {
  if (keypoints.length >= 3) {
    const rightEye = keypoints[0]
    const leftEye = keypoints[1]
    const nose = keypoints[2]
    const eyeDistance = Math.abs(leftEye.x - rightEye.x)
    if (eyeDistance > 0.02) {
      const eyeMidX = (rightEye.x + leftEye.x) / 2
      const yawRatio = Math.abs(nose.x - eyeMidX) / eyeDistance
      if (yawRatio > 0.45) return true
    }
  }

  // Fallback / complementary signal (same rule the legacy engine used):
  // face box center pushed far away from the frame center.
  if (boundingBox && frameWidth > 0) {
    const centerX = boundingBox.originX + boundingBox.width / 2
    const offsetRatio = Math.abs(centerX - frameWidth / 2) / frameWidth
    if (offsetRatio > 0.32) return true
  }

  return false
}

async function createDetectors(): Promise<boolean> {
  const { FilesetResolver, FaceDetector, ObjectDetector } = await import(
    '@mediapipe/tasks-vision'
  )
  const fileset = await FilesetResolver.forVisionTasks(WASM_PATH)

  const createFace = (delegate: 'GPU' | 'CPU') =>
    FaceDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: FACE_MODEL_PATH, delegate },
      runningMode: 'VIDEO',
      minDetectionConfidence: 0.5,
    })
  const createObject = (delegate: 'GPU' | 'CPU') =>
    ObjectDetector.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: OBJECT_MODEL_PATH, delegate },
      runningMode: 'VIDEO',
      scoreThreshold: 0.4,
      maxResults: 10,
    })

  // Prefer the GPU delegate; some devices/browsers fail GPU graph creation,
  // in which case we retry once on CPU before giving up.
  try {
    faceDetector = await createFace('GPU')
    objectDetector = await createObject('GPU')
  } catch (gpuError) {
    console.warn('[MediaPipe] GPU delegate failed, falling back to CPU:', gpuError)
    try {
      faceDetector?.close()
    } catch {
      /* noop */
    }
    faceDetector = null
    objectDetector = null
    faceDetector = await createFace('CPU')
    objectDetector = await createObject('CPU')
  }

  return true
}

/**
 * Loads the WASM runtime + both detectors exactly once. Resolves true when
 * MediaPipe is ready, false when it is unavailable (callers then fall back
 * to the legacy path). Never rejects.
 */
export function ensureMediaPipeLoaded(): Promise<boolean> {
  if (faceDetector && objectDetector) return Promise.resolve(true)
  if (loadFailed) return Promise.resolve(false)
  if (!loadPromise) {
    loadPromise = createDetectors()
      .then((ok) => {
        if (!ok) loadFailed = true
        return ok
      })
      .catch((err) => {
        console.warn('[MediaPipe] Failed to load, proctoring uses fallback path:', err)
        loadFailed = true
        faceDetector = null
        objectDetector = null
        return false
      })
  }
  return loadPromise
}

/** True once both detectors are constructed and ready for detectForVideo. */
export function isMediaPipeReady(): boolean {
  return !!faceDetector && !!objectDetector
}

function monotonic(last: number, timestampMs: number): number {
  // detectForVideo requires strictly increasing timestamps per detector.
  return timestampMs > last ? timestampMs : last + 1
}

/**
 * Runs BlazeFace on the current video frame. Returns null when MediaPipe is
 * unavailable or the frame inference failed (caller should fall back).
 */
export async function detectFaces(
  video: HTMLVideoElement,
  timestampMs: number,
): Promise<FaceFrameResult | null> {
  if (!faceDetector) {
    const ready = await ensureMediaPipeLoaded()
    if (!ready || !faceDetector) return null
  }

  try {
    lastFaceTimestamp = monotonic(lastFaceTimestamp, timestampMs)
    const result = faceDetector.detectForVideo(video, lastFaceTimestamp)
    const frameWidth = video.videoWidth || 0
    const faces: NormalizedFace[] = []
    for (const detection of result.detections) {
      const box = detection.boundingBox
        ? {
            originX: detection.boundingBox.originX,
            originY: detection.boundingBox.originY,
            width: detection.boundingBox.width,
            height: detection.boundingBox.height,
          }
        : null
      const keypoints = (detection.keypoints || []).map((kp) => ({ x: kp.x, y: kp.y }))
      faces.push({
        score: detection.categories?.[0]?.score ?? 0,
        boundingBox: box,
        keypoints,
        gazeAway: computeGazeAway(keypoints, box, frameWidth),
      })
    }
    return { faces }
  } catch (err) {
    if (!detectErrorWarned) {
      detectErrorWarned = true
      console.warn('[MediaPipe] Face detection failed for a frame:', err)
    }
    return null
  }
}

/**
 * Runs EfficientDet-Lite0 on the current video frame. Returns null when
 * MediaPipe is unavailable or the frame inference failed.
 */
export async function detectObjects(
  video: HTMLVideoElement,
  timestampMs: number,
): Promise<ObjectFrameResult | null> {
  if (!objectDetector) {
    const ready = await ensureMediaPipeLoaded()
    if (!ready || !objectDetector) return null
  }

  try {
    lastObjectTimestamp = monotonic(lastObjectTimestamp, timestampMs)
    const result = objectDetector.detectForVideo(video, lastObjectTimestamp)
    const objects: NormalizedObject[] = []
    let phoneDetected = false
    let personCount = 0
    for (const detection of result.detections) {
      const category = detection.categories?.[0]
      if (!category) continue
      const label = category.categoryName
      const score = category.score
      objects.push({
        label,
        score,
        boundingBox: detection.boundingBox
          ? {
              originX: detection.boundingBox.originX,
              originY: detection.boundingBox.originY,
              width: detection.boundingBox.width,
              height: detection.boundingBox.height,
            }
          : null,
      })
      if (score >= OBJECT_FLAG_MIN_SCORE) {
        if (label === PHONE_LABEL) phoneDetected = true
        if (label === PERSON_LABEL) personCount++
      }
    }
    return { objects, phoneDetected, personCount }
  } catch (err) {
    if (!detectErrorWarned) {
      detectErrorWarned = true
      console.warn('[MediaPipe] Object detection failed for a frame:', err)
    }
    return null
  }
}

/** Closes both detectors and resets the singleton so a later start reloads. */
export function closeMediaPipeDetectors(): void {
  try {
    faceDetector?.close()
  } catch {
    /* noop */
  }
  try {
    objectDetector?.close()
  } catch {
    /* noop */
  }
  faceDetector = null
  objectDetector = null
  loadPromise = null
  loadFailed = false
  lastFaceTimestamp = -1
  lastObjectTimestamp = -1
  detectErrorWarned = false
}
