'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

export function GymSuccessStories({ headline, subtitle, customBullets }: SectionProps) {
  const org = useOrgStore(s => s.organization)
  const accentColor = (org as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  return (
    <div className="bg-[#181a1f] py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="mt-5 mb-5">
          {headline && (
            <strong className="text-white uppercase text-[18px] flex items-center gap-2">
              <span className="inline-block w-12 h-[1px] bg-current mr-2" />
              {headline}
            </strong>
          )}
          {subtitle && (
            <h3
              className="text-[18px] md:text-[33px] uppercase mb-5"
              style={{ color: accentColor }}
            >
              {subtitle}
            </h3>
          )}
        </div>

        {/* Story cards */}
        {customBullets && customBullets.length > 0 && (
          <div className="flex flex-wrap -mx-2">
            {customBullets.map((bullet: any, i: number) => {
              const imgUrl = bullet.media ? buildMediaUrl(bullet.media) : ''
              return (
                <div key={i} className="w-full md:w-1/2 px-2 mb-4">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-1/2">
                      {imgUrl && (
                        <Image
                          src={imgUrl}
                          alt={bullet.headline || 'Success story image'}
                          width={400}
                          height={189}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {/* Caption */}
                    <div className="w-full md:w-1/2 bg-[#20232a] px-5 py-5 flex flex-col justify-center" style={{ minHeight: 189 }}>
                      {bullet.headline && (
                        <h3 className="mb-2 text-base" style={{ color: accentColor }}>
                          {bullet.headline}
                        </h3>
                      )}
                      {bullet.content && (
                        <p className="text-[#8d8d8d] mb-0 text-sm">{bullet.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
