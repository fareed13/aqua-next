import type { MetadataRoute } from 'next'
import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  const canonicalHost = (org?.canonical_domain || domain)
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/clearcache',
        '/thank-you',
        '/secret',
        '/admin/',
        '/customers/',
        '/attendance/',
        '/reservation/',
        '/profile/',
        '/belts/',
        '/customer-belts/',
        '/agreements/',
        '/setup/',
        '/curriculum/',
        '/refund-policy/',
      ],
    },
    sitemap: `https://${canonicalHost}/sitemap.xml`,
    host: canonicalHost,
  }
}
