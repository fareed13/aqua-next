'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl } from '@/lib/utils/media'
import { useUiStore } from '@/store/uiStore'

export function CTARightVideo({ headline, content, bullets, media }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []
  const isVideo = media && media.length ? media[0].type === 'video' : false
  const mediaUrl = media && media.length ? buildMediaUrl(media[0]) : ''

  // Only render if media[0] is a video (matches Nuxt v-if="media[0].type === 'video'")
  if (!media || !media.length) return null

  return (
    <div className="relative bg-[#9e0007] py-12 px-0 overflow-hidden">
      {/* Animated circles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20 animate-bounce"
            style={{
              width: [80, 20, 20, 60, 20, 110, 150, 25, 15, 150][i],
              height: [80, 20, 20, 60, 20, 110, 150, 25, 15, 150][i],
              left: `${[25, 10, 70, 40, 65, 75, 35, 50, 20, 85][i]}%`,
              bottom: -150,
              animationDuration: `${[25, 12, 25, 18, 25, 25, 25, 45, 35, 11][i]}s`,
              animationDelay: `${[0, 2, 4, 0, 0, 3, 7, 15, 2, 0][i]}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 py-0">
          {/* Left: text + CTA */}
          <div className="w-full md:w-5/12 flex flex-col justify-center">
            {headline && (
              <h2
                className="text-white font-bold text-2xl md:text-[35px] capitalize"
                dangerouslySetInnerHTML={{ __html: headline }}
              />
            )}
            {content && (
              <div
                className="text-white text-base mt-2"
                dangerouslySetInnerHTML={{ __html: content ?? '' }}
              />
            )}
            {bulletList.length > 0 && (
              <ul className="text-white pt-3 ml-5 list-disc">
                {bulletList.map((bullet, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: bullet }} />
                ))}
              </ul>
            )}
            <button
              onClick={() => setDialog(true)}
              className="w-full mt-3 py-4 text-white font-bold rounded block"
              style={{ backgroundColor: '#d5242c' }}
              aria-label="Secure your spot - beginner classes enrolling right now"
            >
              <p className="text-[22px] md:text-[30px] font-bold capitalize mb-0">Secure your spot!</p>
              <span className="text-sm font-bold">Beginner classes enrolling right now!</span>
            </button>
          </div>

          {/* Right: video or image */}
          <div className="w-full md:w-7/12 flex flex-col justify-center">
            {mediaUrl && (
              isVideo ? (
                <video
                  src={mediaUrl}
                  controls
                  className="w-full object-cover border-4 border-white rounded"
                  style={{ boxShadow: '10px 10px 10px rgba(0,0,0,0.3)', zIndex: 1 }}
                />
              ) : (
                <Image
                  src={mediaUrl}
                  alt={headline || 'CTA image'}
                  width={800}
                  height={500}
                  className="w-full object-cover border-4 border-white rounded"
                  style={{ boxShadow: '10px 10px 10px rgba(0,0,0,0.3)', zIndex: 1 }}
                />
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
