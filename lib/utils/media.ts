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

export function buildMediaUrl(
  media: Media | null | undefined,
  size: number | string = 350,
): string {
  if (!media) return ''
  const id = media.uuid ?? media.name
  if (!id) return ''
  const px = typeof size === 'string' ? (SIZE_MAP[size] ?? 350) : size
  // Videos live on a separate CDN (Nuxt: AMAZONAWS_VIDEO_URL)
  const isVideo = VIDEO_EXTS.has(media.extension?.toLowerCase() ?? '') || media.type === 'video'
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
