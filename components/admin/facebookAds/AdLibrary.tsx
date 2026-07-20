'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''

/** An ad template row returned by the ad-template gallery. */
export interface AdTemplate {
  id?: number
  name: string
  media?: { uuid: string; extension: string } | null
  titles?: string[]
  contents?: string[]
  primary_texts?: string[]
}

function imageSrc(ad: AdTemplate): string {
  if (ad?.media?.uuid) {
    return `${MEDIA_URL}/${ad.media.uuid}_700.${ad.media.extension}`
  }
  return ''
}

const PER_PAGE = 10

/**
 * Ad-template picker (ported from Nuxt AdLibrary.vue). Fetches the ad-template gallery
 * and lists templates as cards. Each card is draggable and clickable — activating it
 * hands the template to the parent (Nuxt emitted `data-updated`) which pre-fills the ad
 * form fields.
 */
export function AdLibrary({ onDataUpdated }: { onDataUpdated: (ad: AdTemplate) => void }) {
  const { getSecure } = useSecureCalls()
  const [libraries, setLibraries] = useState<AdTemplate[]>([])
  const [loader, setLoader] = useState(false)
  const [page, setPage] = useState(1)

  useEffect(() => {
    ;(async () => {
      try {
        setLoader(true)
        const res = await getSecure<AdTemplate[]>(SECURE_ENDPOINTS.LIBRARY_AD_TEMPLATE)
        setLibraries(Array.isArray(res) ? res : [])
      } catch {
        /* handled by interceptor */
      } finally {
        setLoader(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages = Math.max(1, Math.ceil(libraries.length / PER_PAGE))
  const visiblePages = useMemo(
    () => libraries.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [libraries, page],
  )

  return (
    <div className="flex h-full flex-col">
      <div className="px-3 py-3">
        <h2 className="pb-2 text-lg font-semibold text-white">Ad Library</h2>
        <div className="h-px w-full bg-white/40" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {loader ? (
          <div className="mt-16 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-3">
            {visiblePages.map((ad, i) => (
              <div
                key={ad.id ?? i}
                draggable
                onDragStart={() => onDataUpdated(ad)}
                onClick={() => onDataUpdated(ad)}
                className="cursor-pointer rounded-lg bg-white p-3 shadow transition-shadow hover:shadow-md"
                title="Click or drag to use this template"
              >
                <h5 className="mb-1 truncate text-sm font-semibold">{ad.name}</h5>
                {imageSrc(ad) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imageSrc(ad)}
                    alt={ad.name || 'Ad image'}
                    className="h-16 w-full rounded object-cover"
                  />
                )}
                {ad.titles && ad.titles.length > 0 && (
                  <div className="mt-2">
                    <div className="my-1 h-px w-full bg-gray-200" />
                    <h5 className="text-xs font-semibold">Titles</h5>
                    <div className="flex flex-wrap gap-1">
                      {ad.titles.map((title, j) => (
                        <span key={j} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">
                          {title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {ad.contents && ad.contents.length > 0 && (
                  <div className="mt-2">
                    <div className="my-1 h-px w-full bg-gray-200" />
                    <h5 className="text-xs font-semibold">Descriptions</h5>
                    <div className="flex flex-wrap gap-1">
                      {ad.contents.map((content, j) => (
                        <span key={j} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">
                          {content}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {ad.primary_texts && ad.primary_texts.length > 0 && (
                  <div className="mt-2">
                    <div className="my-1 h-px w-full bg-gray-200" />
                    <h5 className="text-xs font-semibold">Primary texts</h5>
                    <div className="flex flex-wrap gap-1">
                      {ad.primary_texts.map((pt, j) => (
                        <span key={j} className="rounded bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700">
                          {pt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {visiblePages.length === 0 && (
              <p className="mt-10 text-center text-sm text-white/70">No ad templates found</p>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 border-t border-white/20 px-3 py-3 text-sm text-white">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded border border-white/40 px-2 py-1 disabled:opacity-40"
          >
            {'‹'}
          </button>
          <span>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded border border-white/40 px-2 py-1 disabled:opacity-40"
          >
            {'›'}
          </button>
        </div>
      )}
    </div>
  )
}
