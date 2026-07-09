'use client'

// `apiClient` is the authenticated client (Bearer login token + organization_id injected
// centrally by the interceptor). Its only direct consumers hit secure endpoints
// (media, agreements, instagram auth), so they now get org_id automatically too.
// New code should prefer the useSecureCalls / useNonSecureCalls hooks.
export { secureClient as apiClient } from './secureClient'
export { ApiError } from './httpClient'
export type { HttpOptions, HttpClient, QueryParams } from './httpClient'
