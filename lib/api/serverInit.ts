import type { ServerInitResponse } from '@/types/api'

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

// All fetches use force-cache — built once at `next build`, never re-fetched in production.
const SSG: RequestInit = { cache: 'force-cache' }

export async function fetchOrganization(domain: string): Promise<ServerInitResponse> {
  if (!domain) throw new Error('Domain is required to fetch organization data')
  const res = await fetch(`${BACKEND_URL}/website/?domain=${domain}`, SSG)
  if (!res.ok) throw new Error(`fetchOrganization failed [${res.status}] for domain: ${domain}`)
  return res.json()
}

export interface MetaTagsResponse {
  title: string
  description: string
  headline: string
}

export async function fetchMetaTags(
  organizationId: number,
  pageName: string,
  pageSlug = '',
  locationId: number | string = '',
): Promise<MetaTagsResponse> {
  const params = new URLSearchParams({
    organization_id: String(organizationId),
    page_name: pageName,
    page_slug: pageSlug,
    location_id: String(locationId),
  })
  try {
    const res = await fetch(`${BACKEND_URL}/website/metatags/?${params}`, SSG)
    if (!res.ok) return { title: '', description: '', headline: '' }
    return res.json()
  } catch {
    return { title: '', description: '', headline: '' }
  }
}

export async function fetchDynamicRoutes(): Promise<string[]> {
  const domain = process.env.NEXT_PUBLIC_DEFAULT_PAGE_DOMAIN ?? ''
  // The dynamic-routes endpoint expects just the subdomain (e.g. "example" from "example.aquilagy.com")
  const subdomain = domain.split('.')[0]
  try {
    const res = await fetch(`${BACKEND_URL}/website/dynamic-routes/?domain=${subdomain}`, SSG)
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function fetchCustomCss(domain: string): Promise<string> {
  try {
    const res = await fetch(`${BACKEND_URL}/website/css/?domain=${domain}`, SSG)
    if (!res.ok) return ''
    const text = await res.json()
    return typeof text === 'string' ? text : ''
  } catch {
    return ''
  }
}
