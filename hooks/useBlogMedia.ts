'use client'

import { useCallback } from 'react'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Media } from '@/types/api'

export function useBlogMedia() {
  const getMediaUrl = useCallback((
    mediaObj: Media | null | undefined,
    size: 'small' | 'medium' | 'large' | 'x-large' | 'xx-large' = 'small'
  ): string | null => {
    if (!mediaObj?.uuid) return null

    const isVideo =
      mediaObj.uuid.slice(-3) === 'mp4' ||
      mediaObj.media_type?.toLowerCase() === 'video'

    if (isVideo) {
      return buildMediaUrl(mediaObj, size === 'large' ? 1000 : size)
    }

    return buildMediaUrl(mediaObj, size)
  }, [])

  return { getMediaUrl }
}
