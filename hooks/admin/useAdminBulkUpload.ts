'use client'

import { useCallback } from 'react'
import { apiClient } from '@/lib/api/fetchClient'
import { SECURE_ENDPOINTS } from '../apiCalls/useApiCalls'

function getAuthToken(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.split('; ').find(c => c.startsWith('auth._token.local='))
  return match ? decodeURIComponent(match.split('=')[1]) : ''
}

export function useAdminBulkUpload() {
  const adminAddFile = useCallback(
    async (filesObject: { location_id: number; file: File }) => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
      const data = new FormData()
      data.append('location_id', String(filesObject.location_id))
      data.append('file', filesObject.file)

      const res = await fetch(`${backendUrl}${SECURE_ENDPOINTS.CUSTOMER_BULK_UPLOAD}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAuthToken()}` },
        body: data,
      })

      if (!res.ok) throw new Error(`Bulk upload failed [${res.status}]`)
      return res.json()
    },
    []
  )

  return { adminAddFile }
}
