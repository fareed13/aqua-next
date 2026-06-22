'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

const STATIC_TESTIMONIALS = [
  { text: 'Krav Maga Self Defense' },
  { text: 'Kickboxing Fitness' },
  { text: 'Kids Martial Arts' },
  { text: 'Krav Maga Self Defense' },
  { text: 'Kickboxing Fitness' },
  { text: 'Kids Martial Arts' },
  { text: 'Krav Maga Self Defense' },
  { text: 'Kickboxing Fitness' },
  { text: 'Kids Martial Arts' },
]

export function Testimonials({ media }: SectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const items = STATIC_TESTIMONIALS

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-center text-[30px]">Can You See Why So Many People Just Like You Are</h3>
        <h2 className="text-center text-[50px] md:text-[70px] font-bold capitalize">
          Moving Their Companies<br />Into ClickFunnels?
        </h2>

        <div className="flex flex-wrap -mx-3">
          {items.map((title, ig) => {
            const imgSrc = media?.length ? buildMediaUrl(media[ig % media.length], 600) : ''
            return (
              <div key={ig} className="w-full sm:w-1/2 md:w-1/3 px-3 mb-7">
                <div className="rounded-none overflow-hidden max-w-[600px]">
                  <div className="relative">
                    {imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={title.text}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-[220px] bg-gray-200" />
                    )}
                    <button
                      onClick={() => setOpenIndex(ig)}
                      className="absolute inset-0 flex flex-col justify-center items-center bg-black/50 text-white uppercase cursor-pointer"
                      aria-label={`Play video: ${title.text}`}
                    >
                      <span className="text-4xl">&#9654;</span>
                    </button>
                  </div>
                </div>
                <h4 className="text-center mt-2 text-[24px]">{title.text}</h4>
              </div>
            )
          })}
        </div>
      </div>

      {/* Video dialog */}
      {openIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setOpenIndex(null)}>
          <div className="relative w-full max-w-3xl mx-4" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setOpenIndex(null)}
              className="absolute -top-4 -right-4 z-10 bg-white rounded-full p-1 shadow"
              aria-label="Close video"
            >
              <X size={20} />
            </button>
            <iframe
              width="100%"
              height="400"
              src="https://www.youtube.com/embed/2Eesbo_x544"
              frameBorder={0}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={items[openIndex]?.text || 'Testimonial video'}
            />
          </div>
        </div>
      )}
    </div>
  )
}
