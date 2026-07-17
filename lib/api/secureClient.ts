'use client'

import { toast } from 'sonner'
import { createHttpClient, type ApiError } from './httpClient'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'

const AUTH_COOKIE = 'auth._token.local'
const USER_COOKIE = 'user'

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

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

// Guard so a burst of parallel secure calls all returning 401 logs the user out once,
// not once per request (which would stack toasts and fight over the redirect).
let sessionExpiredHandled = false

/**
 * Ports Nuxt's `catchErrors` 401 branch (utils/catchErrors.js): on an expired/invalid
 * session, clear auth like `useAuth.logOut` does but from outside React (this runs inside
 * the fetch interceptor, where hooks are unavailable), toast, then send the user home.
 */
function handleUnauthorized() {
  if (typeof window === 'undefined' || sessionExpiredHandled) return
  sessionExpiredHandled = true

  deleteCookie(AUTH_COOKIE)
  deleteCookie(USER_COOKIE)
  // Zustand stores are usable outside React via getState().
  useAuthStore.getState().clearAuth()
  useUiStore.getState().setSettingsVisibleSection(null)

  toast.error('Session expired, please login again')

  // Full navigation (not router.push) — we are outside the React tree and also want the
  // reload to flush any stale authenticated state that hooks may still be holding.
  window.location.assign('/')
}

function onSecureError(error: ApiError, ctx: { method: string; path: string }) {
  // Central error interceptor for authenticated calls (Rollbar-equivalent hook point).
  // Re-thrown by the client afterwards so existing try/catch at call sites still runs.
  if (process.env.NODE_ENV === 'development') {
    console.error(`[secureClient] ${ctx.method} ${ctx.path} -> ${error.status}`, error.data)
  }
  if (error.status === 401) handleUnauthorized()
}

/** Authenticated client: attaches the Bearer login token + organization_id on every request. */
export const secureClient = createHttpClient({
  getAuthHeader,
  onError: onSecureError,
})
