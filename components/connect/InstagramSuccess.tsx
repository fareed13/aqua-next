'use client'

import { useEffect, useState } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { apiClient } from '@/lib/api/fetchClient'

export function InstagramSuccess() {
  const orgId = useOrgStore((s) => s.organization?.id)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState<boolean | null>(null)

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')

      if (!code) {
        setLoading(false)
        return
      }

      try {
        await apiClient.post('/gmb/instagram/auth/', {
          code,
          organization_id: orgId,
        })
        setSuccess(true)
      } catch {
        setSuccess(false)
      } finally {
        setLoading(false)
      }
    }

    if (orgId) handleCallback()
  }, [orgId])

  const message = loading
    ? 'Loading...'
    : success
    ? 'Instagram Connected successfully with Abbi.ai'
    : 'Failed to Connect'

  return (
    <div className="text-center" style={{ margin: '21rem' }}>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}
      <p className="text-[40px] font-bold">{message}</p>
    </div>
  )
}
