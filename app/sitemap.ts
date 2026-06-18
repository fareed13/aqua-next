import type { MetadataRoute } from 'next'
import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

async function fetchDynamicRoutes(domain: string): Promise<string[]> {
  try {
    // Nuxt passes only the subdomain part (e.g. "lahore" from "lahore.abbitest1.com")
    const subdomain = domain.split('.')[0]
    const res = await fetch(
      `${BACKEND_URL}/website/dynamic-routes/?domain=${subdomain}`,
      { cache: 'force-cache' },
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]

  const canonicalHost = (org?.canonical_domain || domain)
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
  const base = `https://${canonicalHost}`

  const routes = await fetchDynamicRoutes(domain)
  const lastmod = new Date().toISOString().split('T')[0]

  const entries: MetadataRoute.Sitemap = routes.map(route => {
    // Normalize to canonical domain (same as Nuxt sitemap config)
    const loc = route.startsWith('http')
      ? route.replace(/^https?:\/\/[^/]+/, base)
      : `${base}${route}`
    return { url: loc, lastModified: lastmod, changeFrequency: 'weekly', priority: 0.8 }
  })

  // Always include the homepage
  if (!entries.find(e => e.url === base || e.url === `${base}/`)) {
    entries.unshift({ url: base, lastModified: lastmod, changeFrequency: 'weekly', priority: 1.0 })
  }

  return entries
}
