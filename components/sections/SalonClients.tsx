'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'
import type { Media } from '@/types/api'

export function SalonClients({ headline, media }: SectionProps) {
  const imgs = Array.isArray(media) ? media : []

  return (
    <div className="px-4 pb-2.5 pt-12">
      <div className="mx-auto table text-center">
        <div className="flex items-center gap-2.5">
          <span style={{ color: 'var(--org-primary)', fontSize: 30 }}>&#8764;</span>
          <h3
            className="text-[30px] font-normal capitalize"
            style={{ color: 'var(--org-primary)' }}
          >
            {headline}
          </h3>
          <span style={{ color: 'var(--org-primary)', fontSize: 30 }}>&#8764;</span>
        </div>
      </div>

      {imgs.length > 0 && (
        <div className="mx-auto max-w-6xl mt-6">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {imgs.map((m: Media, i: number) => {
              if ((m as any).extension === 'mp4') return null
              return (
                <div key={i} className="flex items-center justify-center">
                  <Image
                    src={buildMediaUrl(m)}
                    alt={headline || `Client logo ${i + 1}`}
                    width={200}
                    height={100}
                    className="w-[130px] object-contain md:w-[200px]"
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
