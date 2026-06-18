'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function OfferJoinUs({ headline, subtitle, media }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)
  const loc = useOrgStore(s => s.location)
  const cta = loc?.call_to_action || 'Secure Your First Class'

  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const hasMedia = media && media.length > 0
  const firstMedia = hasMedia ? media![0] : null
  const isImage = firstMedia?.type === 'image'
  const isVideo = firstMedia && !isImage

  const imageUrl = isImage && media ? buildMediaUrl(media[0]) : ''
  const videoUrl = isVideo && media ? buildMediaUrl(media[0]) : ''

  // Lazy-load video after idle callback (2 s fallback)
  useEffect(() => {
    const load = () => setVideoReady(true)
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(load, { timeout: 2000 })
    } else {
      const t = setTimeout(load, 2000)
      return () => clearTimeout(t)
    }
  }, [])

  return (
    <div
      className="relative min-h-[530px] md:min-h-[600px] lg:min-h-[700px]"
    >
      {/* Fallback background color — always visible */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(213,36,44,0.8)', zIndex: 0 }}
      />

      {/* Image background */}
      {isImage && imageUrl && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ zIndex: 1 }}
        >
          <Image
            src={imageUrl}
            alt={headline || 'Offer image'}
            fill
            className="object-cover object-center w-full h-full"
            priority
            sizes="(max-width: 767px) 640px, (max-width: 1024px) 960px, 1920px"
          />
        </div>
      )}

      {/* Video background */}
      {isVideo && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ zIndex: 1 }}
        >
          {videoReady && videoUrl ? (
            <video
              ref={videoRef}
              className="w-full h-full object-cover block"
              loop
              autoPlay
              muted
              playsInline
              preload="none"
              aria-label={headline || 'Offer video'}
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
          ) : (
            <div
              className="w-full h-full min-h-[530px] md:min-h-[700px]"
              style={{ backgroundColor: 'rgba(213,36,44,0.8)' }}
            />
          )}
        </div>
      )}

      {/* Overlay content — centred absolutely */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 2 }}
      >
        <div className="max-w-[1200px] w-full mx-auto px-4 text-center flex flex-col items-center">
          {subtitle && (
            <h3 className="text-white text-xl md:text-2xl font-bold uppercase mb-2">
              {subtitle}
            </h3>
          )}

          {headline && (
            <div className="flex items-center justify-center h-auto md:h-[95px] lg:h-[130px]">
              <h1 className="text-white text-[22px] md:text-[31px] lg:text-[50px] font-bold leading-tight px-2 md:px-0">
                {headline}
              </h1>
            </div>
          )}

          {/* Deal badge — white pill with org primary text */}
          <div
            className="inline-block px-6 py-[3px] mt-10 font-bold text-[18px] md:text-[24px] lg:text-[36px] uppercase"
            style={{
              backgroundColor: '#ffffff',
              color: 'var(--org-primary)',
              borderRadius: '30px 0 30px 0',
            }}
          >
            Special Offer
          </div>

          {/* CTA button */}
          <button
            onClick={() => setDialog(true)}
            aria-label={cta}
            className="text-white border-2 border-white px-[20px] py-[12px] md:px-[42px] md:py-[15px] text-[20px] md:text-[25px] font-bold tracking-wide mt-[50px]"
            style={{
              fontFamily: 'Khand, sans-serif',
              borderRadius: '0px',
              letterSpacing: '1px',
            }}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  )
}
