'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function DentalWeHelp({ customBullets }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const cta = loc?.call_to_action || 'Secure Your First Class'

  const bullets = Array.isArray(customBullets) ? customBullets.slice(0, 3) : []

  return (
    <div className="py-8" style={{ backgroundColor: 'var(--org-primary)' }}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-[750px] text-center">
          <h3 className="text-2xl font-normal text-white md:text-[34px] md:leading-[41px]">
            How can we help?
          </h3>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {bullets.map((bullet: any, i: number) => (
            <div key={i} className="px-2.5 py-8 text-center">
              <div className="mx-auto h-[130px] w-[130px] overflow-hidden rounded-full">
                {bullet.media && (
                  <Image
                    src={buildMediaUrl(bullet.media)}
                    alt={bullet.headline || 'Service icon'}
                    width={130}
                    height={130}
                    className="h-full w-full object-contain"
                  />
                )}
              </div>
              <div className="mt-5">
                <h3 className="text-[17px] font-normal uppercase tracking-wide text-[#82b4e5]">
                  {bullet.headline || ''}
                </h3>
              </div>
              <p className="mt-2.5 text-xs">{bullet.content || ''}</p>
              <button
                onClick={() => setDialog(true)}
                className="mt-8 rounded-full px-8 py-1.5 text-white"
                style={{ border: '1px solid rgba(255,255,255,0.5)' }}
              >
                {cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
