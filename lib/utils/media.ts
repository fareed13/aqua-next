import type { Media } from '@/types/api'

const MEDIA_URL  = process.env.NEXT_PUBLIC_MEDIA_URL  ?? ''
const VIDEO_URL  = process.env.NEXT_PUBLIC_VIDEO_URL  ?? MEDIA_URL

// Matches Nuxt mediaComposable size names → pixel sizes
const SIZE_MAP: Record<string, number> = {
  'small':    350,
  'medium':   700,
  'large':    900,
  'x-large':  1200,
  'xx-large': 1440,
}

const VIDEO_EXTS = new Set(['mp4', 'webm'])

// CloudFront only generates a fixed grid of image derivatives — these exact
// widths (they mirror the Nuxt named sizes plus the 1000 video width). Any other
// width (400, 600, 800, …) returns 403, and next/image's server-side fetch of a
// 403 source renders a broken image. Callers that pass a raw pixel number get
// snapped UP to the nearest generated width (capped at the largest) so the source
// always exists. Named sizes already land on the grid, so they're unaffected.
const AVAILABLE_WIDTHS = [350, 700, 900, 1000, 1200, 1440]

function snapToAvailableWidth(px: number): number {
  return AVAILABLE_WIDTHS.find(w => w >= px) ?? AVAILABLE_WIDTHS[AVAILABLE_WIDTHS.length - 1]
}

/** True when the media is a video, so callers can keep it away from <Image>. */
export function isVideoMedia(media: Media | null | undefined): boolean {
  if (!media) return false
  return VIDEO_EXTS.has(media.extension?.toLowerCase() ?? '') || media.type === 'video'
}

export function buildMediaUrl(
  media: Media | null | undefined,
  size: number | string = 350,
): string {
  if (!media) return ''
  const id = media.uuid ?? media.name
  if (!id) return ''
  // Videos live on a separate CDN (Nuxt: AMAZONAWS_VIDEO_URL)
  const isVideo = VIDEO_EXTS.has(media.extension?.toLowerCase() ?? '') || media.type === 'video'
  const rawPx = typeof size === 'string' ? (SIZE_MAP[size] ?? 350) : size
  // Only image derivatives are pre-generated on the grid; leave video widths as-is.
  const px = isVideo ? rawPx : snapToAvailableWidth(rawPx)
  const base = isVideo ? VIDEO_URL : MEDIA_URL
  return `${base}/${id}_${px}.${media.extension}`
}

// For backgroundImage props — stored as "uuid.extension" plain string (e.g. "abc123.png")
// Nuxt getBackgroundUrl() splits on "." and uses size 1000
export function buildBackgroundUrl(
  backgroundImage: string | null | undefined,
  size: number | string = 1000,
): string {
  if (!backgroundImage) return ''
  const lastDot = backgroundImage.lastIndexOf('.')
  if (lastDot === -1) return ''
  const uuid = backgroundImage.slice(0, lastDot)
  const ext  = backgroundImage.slice(lastDot + 1)
  const px   = typeof size === 'string' ? (SIZE_MAP[size] ?? 1000) : size
  return `${MEDIA_URL}/${uuid}_${px}.${ext}`
}
