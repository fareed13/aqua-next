import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function RowOfImages({ media }: SectionProps) {
  const images = media ?? []

  if (!images.length) return null

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap gap-3">
          {images.map((item, k) => {
            const src = buildMediaUrl(item, 400)
            return (
              <div key={k} className="flex-1 min-w-[100px] m-2 border border-gray-200 shadow-sm">
                {src && (
                  <Image
                    src={src}
                    alt={`Company logo ${k + 1}`}
                    width={300}
                    height={150}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
