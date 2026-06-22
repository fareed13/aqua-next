'use client'

import type { SectionProps } from '@/components/sections/registry'

export function FadedNoImage({ headline, content, bullets, backgroundImage }: SectionProps) {
  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []

  return (
    <div
      className="flex justify-center items-center py-16 bg-cover bg-center"
      style={{
        backgroundImage: backgroundImage
          ? `linear-gradient(rgba(213,36,44,0.65), rgba(213,36,44,0.65)), url('${backgroundImage}')`
          : 'linear-gradient(rgba(213,36,44,0.65), rgba(213,36,44,0.65))',
        minHeight: 300,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {headline && (
            <h2
              className="mb-3 text-white font-normal capitalize text-[28px] md:text-[40px]"
              dangerouslySetInnerHTML={{ __html: headline }}
            />
          )}
          {content && (
            <h5
              className="mb-3 text-white font-normal text-[22px]"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
          {bulletList.length > 0 && (
            <ul className="list-none p-0">
              {bulletList.map((bullet, i) => (
                <li key={i} className="text-white font-normal" dangerouslySetInnerHTML={{ __html: bullet }} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
