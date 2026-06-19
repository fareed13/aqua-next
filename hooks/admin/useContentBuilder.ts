'use client'

import { useCallback } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '../apiCalls/useApiCalls'

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL ?? MEDIA_URL

export function useContentBuilder() {
  const organization = useOrgStore(s => s.organization)
  const { getSecure } = useSecureCalls()

  const baseImageUrl = MEDIA_URL
  const baseVideoUrl = VIDEO_URL

  const fetchMediaByOrganization = useCallback(async () => {
    const orgId = organization?.id
    const orgs = [orgId, 3].filter(Boolean).join(',')
    return getSecure(SECURE_ENDPOINTS.MEDIA, {
      organizations: orgs,
      organization_id: orgId,
    })
  }, [organization, getSecure])

  return {
    organization,
    baseImageUrl,
    baseVideoUrl,
    fetchMediaByOrganization,
  }
}
