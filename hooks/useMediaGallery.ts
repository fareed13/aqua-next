'use client'

import { useCallback } from 'react'

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL ?? MEDIA_URL

function waitForImageAvailable(
  imageUrl: string,
  maxAttempts = 20,
  intervalMs = 500
): Promise<void> {
  return new Promise((resolve) => {
    let attempts = 0

    const checkImage = () => {
      attempts++
      const img = new Image()
      img.onload = () => resolve()
      img.onerror = () => {
        if (attempts >= maxAttempts) {
          resolve()
        } else {
          setTimeout(checkImage, intervalMs)
        }
      }
      img.src = imageUrl
    }

    checkImage()
  })
}

interface MediaItem {
  uuid: string
  extension: string
}

export function useMediaGallery() {
  const getImagePreviewUrl = useCallback(
    (item: MediaItem, shouldWait = false): string | Promise<string> => {
      const isPwaIcon = item.uuid.startsWith('pwa_icon')

      let name: string
      if (isPwaIcon) {
        name = item.uuid
      } else if (item.uuid.includes('.')) {
        name = `${item.uuid.split('.')[0]}_350`
      } else {
        name = `${item.uuid}_350`
      }

      const imagePath = isPwaIcon ? name : `${name}.${item.extension}`

      if (item.extension === 'mp4') {
        return `${VIDEO_URL}/${name}.${item.extension}#t=2`
      }

      const imageUrl = `${MEDIA_URL}/${imagePath}`

      if (shouldWait) {
        return waitForImageAvailable(imageUrl).then(() => imageUrl)
      }
      return imageUrl
    },
    []
  )

  return {
    getImagePreviewUrl,
    waitForImageAvailable,
  }
}
