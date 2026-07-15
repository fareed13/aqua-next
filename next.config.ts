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
    // CloudFront serves the original PNG/JPEG at full size, so going direct
    // ships ~2.6 MB of images on the home page. /_next/image resizes to the
    // device width and re-encodes to WebP/AVIF (~76% smaller on a 10-image
    // sample). CloudFront answers the optimizer's server-side fetch with 200,
    // so the 403s that previously forced `unoptimized: true` no longer occur.
    remotePatterns: [
      { protocol: 'https', hostname: backendHostname },
      { protocol: 'https', hostname: mediaHostname },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
}

export default nextConfig
