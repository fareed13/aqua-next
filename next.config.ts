import type { NextConfig } from 'next'

const backendHostname = (() => {
  try {
    return new URL(process.env.BACKEND_URL ?? 'https://django-backend.abbi.ai').hostname
  } catch {
    return 'django-backend.abbi.ai'
  }
})()

const mediaHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_MEDIA_URL ?? 'https://d3k0lk57n8zw9s.cloudfront.net').hostname
  } catch {
    return 'd3k0lk57n8zw9s.cloudfront.net'
  }
})()

const nextConfig: NextConfig = {
  images: {
    // All media is served from CloudFront which is already a CDN.
    // unoptimized skips the /_next/image proxy so the browser fetches
    // directly from CloudFront — avoids 403s from proxy-blocked requests.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: backendHostname },
      { protocol: 'https', hostname: mediaHostname },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

export default nextConfig
