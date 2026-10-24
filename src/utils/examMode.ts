/** Exam modes: 'live' (all students simultaneously at start_time, shared
 * clock) vs 'non_live' (each student starts independently inside the
 * [start_time, end_time] window, personal clock from begun_at, hard-capped
 * at end_time). All labels come from the API's exam_mode — never invented. */

export type ExamMode = 'live' | 'non_live'

export function normalizeExamMode(value: unknown): ExamMode {
  return value === 'non_live' ? 'non_live' : 'live'
}

export function examModeLabel(mode: unknown): string {
  return normalizeExamMode(mode) === 'live' ? 'Live' : 'Mandiri'
}

/** One-line explanation shown next to the mode picker / badge. */
export function examModeHint(mode: unknown): string {
  return normalizeExamMode(mode) === 'live'
    ? 'Semua siswa mulai serentak pada waktu yang ditentukan.'
    : 'Siswa mulai sendiri kapan saja dalam jendela waktu.'
}

/** "12 Jan 2026, 08.00 – 10.00" — id-ID, 24h. Returns '—' when either
 * bound is missing instead of inventing a time. */
export function formatExamWindow(startTime?: string | null, endTime?: string | null): string {
  if (!startTime || !endTime) return '—'
  const start = new Date(startTime)
  const end = new Date(endTime)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—'
  const day = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(start)
  const time = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return `${day}, ${time.format(start)}–${time.format(end)}`
}

/** Short date-time for a single bound, e.g. "12 Jan 2026, 08.00". */
export function formatExamDateTime(value?: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const day = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d)
  const time = new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
  return `${day}, ${time}`
}

/** True when a live exam has not reached its fixed start yet. */
export function isLiveNotStarted(mode: unknown, startTime?: string | null): boolean {
  if (normalizeExamMode(mode) !== 'live' || !startTime) return false
  return Date.now() < new Date(startTime).getTime()
}
