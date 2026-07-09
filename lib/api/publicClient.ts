'use client'

import { createHttpClient, type ApiError } from './httpClient'

function onPublicError(error: ApiError, ctx: { method: string; path: string }) {
  // Central error interceptor for public calls (Rollbar-equivalent hook point).
  // Re-thrown by the client afterwards so existing try/catch at call sites still runs.
  if (process.env.NODE_ENV === 'development') {
    console.error(`[publicClient] ${ctx.method} ${ctx.path} -> ${error.status}`, error.data)
  }
}

/**
 * Public / non-secure client: injects organization_id but NEVER the login token
 * (matches the Nuxt nonSecureCalls behaviour). Endpoints that need a recaptcha or
 * purchase token pass it explicitly via `headers: { Authorization }`
 * (see postPublicProtected / getPublicProtected).
 */
export const publicClient = createHttpClient({
  onError: onPublicError,
})
