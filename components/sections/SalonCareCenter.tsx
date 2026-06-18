'use client'

import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function SalonCareCenter({ headline, subtitle, content, media }: SectionProps) {
  const loc = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)

  const imgs = Array.isArray(media) ? media : []

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="relative mb-24">
          {/* Main card */}
          <div className="max-w-[900px] px-8 py-12 shadow-[0px_0px_28px_#cccccc78] md:pr-[10%]">
            <h3
              className="mb-5 text-[24px] font-normal leading-[35px] md:text-[30px]"
              style={{ color: 'var(--org-primary)' }}
            >
              {headline}
            </h3>
            <h4 className="mb-3 text-2xl font-normal leading-[35px]">{subtitle}</h4>
            {content && (
              <div
                className="text-[17px] leading-8 text-[#555555]"
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
              />
            )}
            <div className="mt-8 flex flex-col gap-4 pb-10 md:flex-row md:items-center">
              <button
                onClick={() => setDialog(true)}
                className="px-10 py-6 text-white"
                style={{ backgroundColor: 'var(--org-primary)', borderRadius: 0 }}
                aria-label="Book now"
              >
                Book Now
              </button>
              {loc?.pretty_phone && (
                <span className="font-serif text-lg md:text-2xl">
                  Call:{' '}
                  <a
                    href={`tel:${loc.pretty_phone}`}
                    className="text-black no-underline"
                    aria-label={`Call ${loc.pretty_phone}`}
                  >
                    {loc.pretty_phone}
                  </a>
                </span>
              )}
            </div>
          </div>

          {/* Right image */}
          {imgs.length > 1 && (
            <div className="mt-5 md:absolute md:right-0 md:top-5 md:mt-0 md:max-w-[330px]">
              <Image
                src={buildMediaUrl(imgs[1])}
                alt={headline || 'Care center image'}
                width={360}
                height={375}
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* Bottom image */}
          {imgs.length > 2 && (
            <div className="mt-5 md:absolute md:bottom-[-79px] md:right-[5%] md:mt-0 md:max-w-[380px]">
              <Image
                src={buildMediaUrl(imgs[2])}
                alt={headline || 'Care center image'}
                width={360}
                height={200}
                className="h-auto w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
