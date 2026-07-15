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

// Videos live on their own CDN (buildMediaUrl switches to it for mp4/webm).
// It has to be listed too: next/image validates the hostname before it ever
// looks at whether the image is optimized, so a poster or a stray video URL
// reaching <Image> hard-errors the page without this.
const videoHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_VIDEO_URL ?? 'https://duvyeenkq0cxj.cloudfront.net').hostname
  } catch {
    return 'duvyeenkq0cxj.cloudfront.net'
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
      { protocol: 'https', hostname: videoHostname },
      { protocol: 'http', hostname: 'localhost' },
      // Instagram serves each post from a rotating, region-specific host
      // (scontent-ord5-3, scontent-lax3-1, …) so only a wildcard can match.
      // These are validated even for `unoptimized` images, which the feed uses
      // because the URLs carry an expiring signature.
      { protocol: 'https', hostname: '**.cdninstagram.com' },
      { protocol: 'https', hostname: '**.fbcdn.net' },
    ],
  },
}

export default nextConfig
