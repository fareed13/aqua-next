'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAdminMediaCrud } from './admin/useAdminMedia'

interface MediaDataObj {
  filename: string
  name: string
  uuid: string
  extension: string
  topics: string[]
  types: string[]
  facility: boolean
  facility_location: number | null
  media_type: string
  pwa_icon: boolean
  background_image: boolean
  is_secure: boolean
}

interface UseMediaUploaderOptions {
  platform?: string | null
}

export function useMediaUploader(options: UseMediaUploaderOptions = {}) {
  const { platform } = options
  const { adminAddMedia, getMediaById, adminUpdateMedia } = useAdminMediaCrud()

  const [files, setFiles] = useState<File[]>([])
  const [dataObj, setDataObj] = useState<MediaDataObj[]>([])
  const [facilities, setFacilities] = useState<unknown[]>([])
  const [backgrounds, setBackgrounds] = useState<unknown[]>([])

  const isSecure = platform === 'mobile_app'

  useEffect(() => {
    setDataObj(
      files.map((f) => ({
        filename: f.name,
        name: f.name,
        uuid: '',
        extension: '',
        topics: [],
        types: [],
        facility: false,
        facility_location: null,
        media_type: '',
        pwa_icon: false,
        background_image: false,
        is_secure: isSecure,
      }))
    )
  }, [files, isSecure])

  const checkMediaValidation = useCallback(() => {
    return dataObj.every((el) => el.types.length > 0)
  }, [dataObj])

  const getPreview = useCallback((file: File) => {
    return URL.createObjectURL(file)
  }, [])

  const arrangeMutation = useCallback(() => {
    const result: { files: File[]; mediaDetails?: Record<string, unknown> } = { files }
    const mediaDetails: Record<string, unknown> = {}
    files.forEach((file, i) => {
      const obj = dataObj[i]
      if (!obj) return
      mediaDetails[file.name] = {
        name: obj.name,
        topics: obj.topics,
        types: obj.types,
        pwa_icon: obj.pwa_icon,
        facility_location: obj.facility_location,
        background_image: obj.background_image,
        is_secure: obj.is_secure,
      }
    })
    if (Object.keys(mediaDetails).length) {
      result.mediaDetails = mediaDetails
    }
    return result
  }, [files, dataObj])

  const upload = useCallback(
    async (isGlobal = false) => {
      if (files.length < 1) return
      try {
        const response = await adminAddMedia(arrangeMutation(), isGlobal)
        setFiles([])
        return response
      } catch (error) {
        console.error(error)
      }
    },
    [files, arrangeMutation, adminAddMedia]
  )

  return {
    files,
    setFiles,
    dataObj,
    setDataObj,
    facilities,
    backgrounds,
    checkMediaValidation,
    getPreview,
    upload,
    arrangeMutation,
    getMediaById,
    adminUpdateMedia,
  }
}
