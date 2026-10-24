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

/**
 * JWT for WebSocket auth, read from the same storage key the API client
 * uses (`examind_token`). WS endpoints require `?token=<accessToken>`;
 * returns '' when logged out (caller should skip connecting).
 */
export function wsAuthToken(): string {
  if (typeof window === 'undefined') return ''
  try {
    return localStorage.getItem('examind_token') || ''
  } catch {
    return ''
  }
}

/** Append ?token=<JWT> to a WS URL (no-op when no token is stored). */
export function withWsToken(url: string): string {
  const token = wsAuthToken()
  if (!token) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}token=${encodeURIComponent(token)}`
}
