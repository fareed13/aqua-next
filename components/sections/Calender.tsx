'use client'

import type { SectionProps } from '@/components/sections/registry'

export function Calender({ headline, url }: SectionProps) {
  const isValidUrl = url && (url.startsWith('http://') || url.startsWith('https://'))

  if (!isValidUrl) return null

  return (
    <div className="px-0 py-0">
      <div className="max-w-7xl mx-auto px-4">
        {headline && (
          <h2 className="text-center text-4xl md:text-[50px] font-bold my-8">
            {headline}
          </h2>
        )}
        <div className="w-full">
          <iframe
            src={url}
            width="600"
            height="500"
            frameBorder="0"
            style={{ border: 0, width: '100%' }}
            title={headline || 'Calendar'}
            aria-label={headline || 'Calendar'}
            tabIndex={0}
            className="w-full h-[400px] md:h-[500px]"
          />
        </div>
      </div>
    </div>
  )
}
