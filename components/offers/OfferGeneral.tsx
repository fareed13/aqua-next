'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useUiStore } from '@/store/uiStore'

export function OfferGeneral({ headline, subtitle, content, media, bullets }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const imgSrc = media && media.length > 0 ? buildMediaUrl(media[0]) : ''

  return (
    <section className="py-12 overflow-hidden">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left content column — 7 cols on md */}
          <div className="w-full md:w-7/12 py-4">
            {headline && (
              <h2 className="text-[35px] uppercase leading-tight font-bold mb-2">
                {headline}
              </h2>
            )}

            {subtitle && (
              <h4
                className="text-[26px] font-bold relative ml-[60px] mb-4"
                style={{ fontFamily: 'Khand, sans-serif' }}
              >
                <span
                  className="absolute top-[18px] left-[-60px] w-[50px] border-t-2"
                  style={{ borderColor: 'var(--org-primary)' }}
                />
                {subtitle}
                <span
                  className="absolute top-[18px] w-[50px] border-t-2 ml-[10px]"
                  style={{ borderColor: 'var(--org-primary)' }}
                />
              </h4>
            )}

            {content && (
              <div
                className="mb-4 prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
              />
            )}

            <ul className="my-5 space-y-2 list-none p-0 m-0">
              {bulletList.map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="flex-shrink-0 text-black"
                  >
                    <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="flex-shrink-0 text-black"
                >
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
                <span>Limited Time Offer / New Clients Only</span>
              </li>
              <li className="flex items-center gap-2">
                <svg
                  width="35"
                  height="35"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="flex-shrink-0 text-black"
                >
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                </svg>
                <span>
                  100% Money Back Guarantee. If you&apos;re not completely satisfied for any reason,
                  we will refund your purchase no questions asked
                </span>
              </li>
            </ul>

            {/* CTA button */}
            <button
              onClick={() => setDialog(true)}
              aria-label="Secure your spot - Beginner classes enrolling right now"
              className="w-full text-white py-5 px-6 rounded block mt-4 cursor-pointer"
              style={{ backgroundColor: 'var(--org-primary)' }}
            >
              <p
                className="m-0 text-[22px] md:text-[30px] font-bold tracking-widest capitalize leading-none"
                style={{ fontFamily: 'Khand, sans-serif' }}
              >
                Secure your spot!
              </p>
              <span className="text-sm md:text-base font-bold">
                Beginner classes enrolling right now!
              </span>
            </button>
          </div>

          {/* Right image column — 5 cols on md */}
          <div className="w-full md:w-5/12">
            {imgSrc && (
              <div
                className="relative w-full"
                style={{ boxShadow: '-15px -15px 0 var(--org-primary)' }}
              >
                <Image
                  src={imgSrc}
                  alt={headline || 'Offer image'}
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
