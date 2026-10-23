/** Human-friendly Indonesian labels for proctoring event types.
 * Teachers and students should never see raw snake_case event codes. */
export const PROCTORING_EVENT_LABELS: Record<string, string> = {
  face_absent: 'Wajah tidak terdeteksi',
  multiple_faces: 'Lebih dari satu wajah',
  gaze_away: 'Menoleh dari layar',
  tab_switch: 'Pindah tab / aplikasi',
  fullscreen_exit: 'Keluar mode layar penuh',
  suspicious_object: 'Objek mencurigakan',
  companion_disconnected: 'Kamera kedua terputus',
  phone_detected: 'HP terdeteksi',
  camera_error: 'Kamera bermasalah',
}

export function proctoringEventLabel(eventType: string): string {
  return PROCTORING_EVENT_LABELS[eventType] ?? eventType.replace(/_/g, ' ')
}

export const CAMERA_SOURCE_LABELS: Record<string, string> = {
  primary_camera: 'Kamera utama',
  secondary_camera: 'Kamera kedua (HP)',
  system_event: 'Sistem',
}

export function cameraSourceLabel(source: string): string {
  return CAMERA_SOURCE_LABELS[source] ?? source.replace(/_/g, ' ')
}
