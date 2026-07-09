'use client'

import { createHttpClient, type ApiError } from './httpClient'

const AUTH_COOKIE = 'auth._token.local'

/**
 * The one place the login token is read for authenticated requests.
 * The cookie value is stored already prefixed with "Bearer " (see useLogin), so we
 * only add the prefix if it is missing.
 */
function getAuthHeader(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.split('; ').find((c) => c.startsWith(`${AUTH_COOKIE}=`))
  if (!match) return ''
  let raw: string
  try {
    raw = decodeURIComponent(match.split('=')[1])
  } catch {
    raw = match.split('=')[1]
  }
  if (!raw) return ''
  return raw.startsWith('Bearer ') ? raw : `Bearer ${raw}`
}

function onSecureError(error: ApiError, ctx: { method: string; path: string }) {
  // Central error interceptor for authenticated calls (Rollbar-equivalent hook point).
  // Re-thrown by the client afterwards so existing try/catch at call sites still runs.
  if (process.env.NODE_ENV === 'development') {
    console.error(`[secureClient] ${ctx.method} ${ctx.path} -> ${error.status}`, error.data)
  }
}

/** Authenticated client: attaches the Bearer login token + organization_id on every request. */
export const secureClient = createHttpClient({
  getAuthHeader,
  onError: onSecureError,
})
