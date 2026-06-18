'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

export function GymInfoCard({ customBullets }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const accentColor = (org as any)?.colors?.['app-main-accent-with-transparent'] || 'var(--org-primary)'

  if (!customBullets || !customBullets.length) return null

  return (
    <div className="px-0 py-0">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row flex-wrap">
          {customBullets.map((bullet: any, i: number) => {
            const imgUrl = bullet.media ? buildMediaUrl(bullet.media) : ''
            return (
              <div key={i} className="w-full md:w-1/3 relative" style={{ marginRight: i < customBullets.length - 1 ? 2 : 0 }}>
                <div className="relative overflow-hidden">
                  {/* Color overlay */}
                  <div
                    className="absolute inset-0 z-0"
                    style={{ backgroundColor: accentColor }}
                  />
                  {imgUrl && (
                    <Image
                      src={imgUrl}
                      alt={bullet.headline || 'Gym info card image'}
                      width={400}
                      height={260}
                      className="w-full object-cover relative z-10"
                      style={{ height: 260, display: 'block' }}
                    />
                  )}
                  {/* Caption overlay */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center text-center px-4">
                    {bullet.content && (
                      <p className="text-[40px] font-bold mb-4 flex flex-wrap w-[98%]">
                        {bullet.content}
                      </p>
                    )}
                    {bullet.headline && (
                      <h3 className="uppercase text-[18px] font-black leading-[22px] max-w-[220px] mx-auto text-white">
                        {bullet.headline}
                      </h3>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
