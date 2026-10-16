/**
 * Base URL for WebSocket connections to the FastAPI backend.
 *
 * NEXT_PUBLIC_WS_URL: full WS(S) base, e.g. wss://<backend-host>
 *   Local dev : unset → falls back to the page's own host (same-origin)
 *   Production: wss://rnov24--examind-be-api.us-east.modal.run
 *   (Next.js rewrites don't proxy WebSocket upgrades, so the browser must
 *   connect to the backend directly in production.)
 */
export function wsBaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_WS_URL
  if (env && env.trim()) return env.trim().replace(/\/$/, '')
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    return `${protocol}//${window.location.host}`
  }
  return ''
}
