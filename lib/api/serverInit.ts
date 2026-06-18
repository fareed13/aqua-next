import type { ServerInitResponse } from '@/types/api'

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

/**
 * Fetches organization data at build time only.
 * cache: 'force-cache' — Next.js caches this during `next build` and
 * never re-fetches it in production. Zero backend calls after deploy.
 * To update org data, trigger a new Netlify build.
 */
export async function fetchOrganization(domain: string): Promise<ServerInitResponse> {
  if (!domain) throw new Error('Domain is required to fetch organization data')

  const res = await fetch(`${BACKEND_URL}/website/?domain=${domain}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'force-cache',
  })

  if (!res.ok) {
    throw new Error(`fetchOrganization failed [${res.status}] for domain: ${domain}`)
  }

  const data: ServerInitResponse = await res.json()
  // console.log('🚀 fetchOrganization response:', JSON.stringify(data, null, 2))
  return data
}
