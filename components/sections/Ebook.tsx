'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useUiStore } from '@/store/uiStore'

export function Ebook({ headline, subtitle, content, media }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)
  const imgUrl = media && media.length ? buildMediaUrl(media[0]) : ''

  return (
    <div className="py-12 px-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left: 3D book effect */}
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="w-full max-w-[300px]">
              {/* Simplified 3D book with hover transform */}
              <div
                className="relative w-full h-[400px] transition-transform duration-500"
                style={{
                  perspective: '1800px',
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  className="absolute inset-0 rounded-r bg-[#ff924a] flex items-center justify-center overflow-hidden"
                  style={{
                    transform: 'translate3d(0, 0, 20px)',
                    boxShadow: 'inset 4px 0 10px rgba(0,0,0,0.1)',
                  }}
                >
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={headline || 'E-book cover'}
                      width={300}
                      height={400}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#ff924a] flex items-center justify-center">
                      <span className="text-white text-4xl">&#128218;</span>
                    </div>
                  )}
                </div>
                {/* Book spine */}
                <div
                  className="absolute bg-[#ff924a]"
                  style={{
                    width: 40,
                    left: -20,
                    top: 0,
                    bottom: 0,
                    transform: 'rotateY(-90deg)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: content */}
          <div className="w-full md:w-2/3 flex flex-col justify-center">
            <div className="text-center md:text-left">
              {headline && (
                <h2 className="text-3xl md:text-[50px] font-bold">{headline}</h2>
              )}
              {subtitle && (
                <h3 className="text-xl md:text-[30px]">{subtitle}</h3>
              )}
              {content && (
                <div dangerouslySetInnerHTML={{ __html: content ?? '' }} />
              )}
              <button
                onClick={() => setDialog(true)}
                className="mx-auto md:mx-0 mt-8 px-8 py-4 text-white font-bold rounded block"
                style={{ backgroundColor: '#d0544e' }}
                aria-label="Inquire now and receive free e-book"
              >
                <p className="text-xl md:text-[24px] font-bold m-0">Inquire Now And Receive FREE E-book</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
