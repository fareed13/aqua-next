import type { MetadataRoute } from 'next'
import { getDomain } from '@/lib/utils/getDomain'

// Matches Nuxt pwa.manifest — name = domain, icons = static icon.png
export default function manifest(): MetadataRoute.Manifest {
  const domain = getDomain()

  return {
    name: domain,
    short_name: domain,
    description: domain,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#ffffff',
    icons: [
      { src: '/icon.png', sizes: '64x64',   type: 'image/png' },
      { src: '/icon.png', sizes: '144x144', type: 'image/png' },
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
