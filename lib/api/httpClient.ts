'use client'

import { useOrgStore } from '@/store/orgStore'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

export type QueryParams = Record<string, string | number | boolean | undefined>

export interface HttpOptions {
  params?: QueryParams
  headers?: Record<string, string>
  body?: unknown
  /** 'json' (default) parses the response; 'arraybuffer' returns the raw bytes (PDF/agreement downloads). */
  responseType?: 'json' | 'arraybuffer'
  /** Set false to skip the automatic organization_id query param (rarely needed). */
  sendOrgId?: boolean
}

/**
 * Axios-shaped error so ported Nuxt/axios call sites that read `err.response.data.message`
 * keep working, while new code can read `err.status` / `err.data` directly.
 */
export class ApiError extends Error {
  status: number
  data: unknown
  response: { status: number; data: unknown }

  constructor(status: number, statusText: string, data: unknown) {
    const detail = typeof data === 'string' ? data : ''
    super(`${status} ${statusText}${detail ? `: ${detail}` : ''}`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
    this.response = { status, data }
  }
}

export interface ClientConfig {
  /** Request interceptor: returns the Authorization header to attach ('' = none). */
  getAuthHeader?: () => string
  /** Response error interceptor: runs before the ApiError is thrown (logging/Rollbar). */
  onError?: (error: ApiError, context: { method: string; path: string }) => void
}

function buildUrl(path: string, params: QueryParams | undefined, sendOrgId: boolean): string {
  const url = new URL(`${BACKEND_URL}${path}`)
  // Interceptor: always inject the *current* organization_id (read at call-time, not render-time)
  // so requests fired before the org store hydrates still carry it. Callers may override it via params.
  const orgId = sendOrgId ? useOrgStore.getState().organization?.id : undefined
  const merged: QueryParams = sendOrgId ? { organization_id: orgId, ...params } : { ...params }
  Object.entries(merged).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value))
  })
  return url.toString()
}

/**
 * Builds an HTTP client with a fixed auth strategy. `secureClient` and `publicClient`
 * are the two instances; this keeps token/org-id logic in one place instead of at every call site.
 */
export function createHttpClient(config: ClientConfig = {}) {
  async function request<T>(method: string, path: string, options: HttpOptions = {}): Promise<T> {
    const { params, headers, body, responseType = 'json', sendOrgId = true } = options
    const authHeader = config.getAuthHeader?.() ?? ''

    const res = await fetch(buildUrl(path, params, sendOrgId), {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const raw = await res.text().catch(() => '')
      let data: unknown = raw
      try {
        data = raw ? JSON.parse(raw) : ''
      } catch {
        /* keep raw text */
      }
      const error = new ApiError(res.status, res.statusText, data)
      config.onError?.(error, { method, path })
      throw error
    }

    if (responseType === 'arraybuffer') {
      return (await res.arrayBuffer()) as unknown as T
    }

    const text = await res.text()
    return text ? (JSON.parse(text) as T) : (undefined as T)
  }

  return {
    get: <T = unknown>(path: string, options?: HttpOptions) => request<T>('GET', path, options),
    post: <T = unknown>(path: string, body?: unknown, options?: HttpOptions) =>
      request<T>('POST', path, { ...options, body }),
    put: <T = unknown>(path: string, body?: unknown, options?: HttpOptions) =>
      request<T>('PUT', path, { ...options, body }),
    patch: <T = unknown>(path: string, body?: unknown, options?: HttpOptions) =>
      request<T>('PATCH', path, { ...options, body }),
    delete: <T = unknown>(path: string, options?: HttpOptions) => request<T>('DELETE', path, options),
  }
}

export type HttpClient = ReturnType<typeof createHttpClient>
