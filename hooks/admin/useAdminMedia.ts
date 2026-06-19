'use client'

import { useCallback } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { apiClient } from '@/lib/api/fetchClient'
import { SECURE_ENDPOINTS } from '../apiCalls/useApiCalls'

function getAuthToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.split('; ').find(c => c.startsWith('auth._token.local='))
  return match ? decodeURIComponent(match.split('=')[1]) : ''
}

export function useAdminMediaCrud() {
  const organization = useOrgStore(s => s.organization)
  const orgId = organization?.id

  const adminAddMedia = useCallback(
    async (filesObject: { files: File[]; mediaDetails?: Record<string, unknown> }, isGlobal = false) => {
      const targetOrgId = isGlobal
        ? (process.env.NEXT_PUBLIC_ABBI_DEFAULT_ORGANIZATION_ID ?? 3)
        : orgId

      const data = new FormData()
      data.append('organization_id', String(targetOrgId))
      filesObject.files.forEach(file => data.append('list_media', file))
      if (filesObject.mediaDetails) {
        data.append('media_detail', JSON.stringify(filesObject.mediaDetails))
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
      const res = await fetch(`${backendUrl}${SECURE_ENDPOINTS.MEDIA}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: data,
      })
      if (!res.ok) throw new Error(`Media upload failed [${res.status}]`)
      return res.json()
    },
    [orgId]
  )

  const fetchMediaByOrganization = useCallback(async () => {
    const orgs = [orgId, 3].filter(Boolean).join(',')
    return apiClient.get(SECURE_ENDPOINTS.MEDIA, {
      params: { organizations: orgs, organization_id: orgId },
    })
  }, [orgId])

  const getMediaById = useCallback(
    async (id: number) => {
      const orgs = [orgId, 3].filter(Boolean).join(',')
      return apiClient.get(SECURE_ENDPOINTS.MEDIA, {
        params: { id: String(id), organizations: orgs, organization_id: orgId },
      })
    },
    [orgId]
  )

  const adminUpdateMedia = useCallback(
    async (createObj: unknown) => {
      const orgs = [orgId, 3].filter(Boolean).join(',')
      return apiClient.put(SECURE_ENDPOINTS.MEDIA, createObj, {
        params: { organizations: orgs, organization_id: orgId },
      })
    },
    [orgId]
  )

  const deleteMedia = useCallback(
    async (id: number) => {
      const orgs = [orgId, 3].filter(Boolean).join(',')
      return apiClient.delete(SECURE_ENDPOINTS.MEDIA, {
        params: { organizations: orgs, organization_id: orgId },
        body: { id },
      } as any)
    },
    [orgId]
  )

  return {
    organization,
    adminAddMedia,
    fetchMediaByOrganization,
    getMediaById,
    adminUpdateMedia,
    deleteMedia,
  }
}
