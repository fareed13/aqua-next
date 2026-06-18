'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'

export function AwardsDefault({ headline, customBullets }: SectionProps) {
  const bulletArr = Array.isArray(customBullets) ? customBullets : []

  return (
    <div className="relative py-12 px-0 overflow-hidden">
      {/* Animated background circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ul className="absolute inset-0 list-none p-0 m-0">
          {Array.from({ length: 10 }).map((_, i) => (
            <li
              key={i}
              className="absolute block rounded-none bg-white/20"
              style={{
                width: [80, 20, 20, 60, 20, 110, 150, 25, 15, 150][i],
                height: [80, 20, 20, 60, 20, 110, 150, 25, 15, 150][i],
                left: ['25%', '10%', '70%', '40%', '65%', '75%', '35%', '50%', '20%', '85%'][i],
                bottom: -150,
                animation: `floatUp ${[25, 12, 25, 18, 25, 25, 25, 45, 35, 11][i]}s linear infinite`,
                animationDelay: `${[0, 2, 4, 0, 0, 3, 7, 15, 2, 0][i]}s`,
              }}
            />
          ))}
        </ul>
      </div>

      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; border-radius: 0; }
          100% { transform: translateY(-1000px) rotate(720deg); opacity: 0; border-radius: 50%; }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 relative">
        {headline && (
          <h3 className="text-center capitalize text-5xl md:text-[70px] font-bold mb-6">
            {headline}
          </h3>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-around">
          {bulletArr.map((bullet: any, i: number) => {
            const imgUrl = bullet.media ? buildMediaUrl(bullet.media) : ''
            return (
              <div key={i} className="bg-[#dfdfdf] rounded p-5 h-full">
                <div className="mb-4">
                  {imgUrl && (
                    <Image
                      src={imgUrl}
                      alt={bullet.headline || 'Award image'}
                      width={300}
                      height={200}
                      className="w-full max-h-[200px] object-contain"
                    />
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-black">{bullet.headline}</h3>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
