'use client'

import { useState, useEffect } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useNonSecureCalls, NON_SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface PdfViewerProps {
  slug: string
}

export function PdfViewer({ slug }: PdfViewerProps) {
  const organization = useOrgStore(s => s.organization)
  const { getPublic } = useNonSecureCalls()

  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPdf() {
      try {
        setLoading(true)
        const res: any = await getPublic(NON_SECURE_ENDPOINTS.PDF, {
          organization_id: organization?.id,
          slug,
        })
        setUrl(res?.pdf_file_url ?? '')
      } catch {
        /* handled */
      } finally {
        setLoading(false)
      }
    }
    fetchPdf()
  }, [slug, organization?.id, getPublic])

  if (loading) {
    return (
      <div className="min-h-[80vh] bg-[#24364e] flex items-center justify-center">
        <div className="text-white text-lg">Loading PDF...</div>
      </div>
    )
  }

  if (!url) {
    return (
      <div className="min-h-[80vh] bg-[#24364e] flex items-center justify-center">
        <div className="text-white text-lg">PDF not found</div>
      </div>
    )
  }

  return (
    <div className="relative bg-[#24364e] min-h-[80vh] pt-5">
      <iframe
        src={url}
        className="w-full h-[80vh] relative z-[1]"
        title="PDF Viewer"
      />
    </div>
  )
}
