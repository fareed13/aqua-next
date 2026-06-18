import type { MetadataRoute } from 'next'
import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? 'https://d3k0lk57n8zw9s.cloudfront.net'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]

  const icon = org?.primary_logo?.uuid
    ? `${MEDIA_URL}/${org.primary_logo.uuid}_350.${org.primary_logo.extension}`
    : undefined

  return {
    name: domain,
    short_name: domain,
    description: domain,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: icon ? [
      { src: icon, sizes: '64x64',   type: 'image/png' },
      { src: icon, sizes: '144x144', type: 'image/png' },
      { src: icon, sizes: '192x192', type: 'image/png' },
      { src: icon, sizes: '512x512', type: 'image/png' },
      { src: icon, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ] : [],
  }
}
