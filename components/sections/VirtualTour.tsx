'use client'

import { useEffect, useRef, useState } from 'react'
import type { SectionProps } from '@/components/sections/registry'

export function VirtualTour({ headline, url }: SectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [iframeReady, setIframeReady] = useState(false)

  useEffect(() => {
    if (!wrapperRef.current) return
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            setIframeReady(true)
            io.disconnect()
          }
        },
        { rootMargin: '300px' }
      )
      io.observe(wrapperRef.current)
      return () => io.disconnect()
    } else {
      setIframeReady(true)
    }
  }, [])

  return (
    <div className="px-0">
      <h2 className="mx-auto my-8 text-center text-[40px] font-bold md:text-[50px]">
        {headline}
      </h2>
      <div ref={wrapperRef}>
        {iframeReady && url ? (
          <iframe
            src={url as string}
            width="600"
            height="500"
            frameBorder="0"
            style={{ border: 0, width: '100%' }}
            allowFullScreen
            loading="lazy"
            title={headline || 'Virtual tour'}
            aria-label={headline || 'Virtual tour'}
            className="h-[400px] w-full md:h-[500px]"
          />
        ) : (
          <div className="h-[400px] w-full bg-[#f0f0f0] md:h-[500px]" aria-hidden="true" />
        )}
      </div>
    </div>
  )
}
