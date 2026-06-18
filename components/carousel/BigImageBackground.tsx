'use client'

import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'
import type { SectionProps } from '@/components/sections/registry'
import { buildMediaUrl, buildBackgroundUrl } from '@/lib/utils/media'
import { useOrgStore } from '@/store/orgStore'

export function BigImageBackground({
  headline,
  content,
  bullets,
  media,
  backgroundImage,
}: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false)
  const [isVerticalVideo, setIsVerticalVideo] = useState(false)
  const [videoAspectRatio, setVideoAspectRatio] = useState('1000 / 712')
  const videoWrapperRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []

  // backgroundImage is stored as "uuid.extension" string — use buildBackgroundUrl (size 1000)
  const bgUrl = buildBackgroundUrl(backgroundImage) ||
    (media && media.length > 0 && media[0].extension !== 'mp4' ? buildMediaUrl(media[0], 'large') : '')

  // Right-side media: first media item that is an image, or the video
  const rightMedia = media && media.length > 0 ? media[0] : null
  const isVideo = rightMedia?.extension === 'mp4' || rightMedia?.type === 'video'

  const mediaUrl = rightMedia ? buildMediaUrl(rightMedia, isVideo ? 1000 : 'large') : ''

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 959px)').matches
    if (isMobile) {
      // On mobile delay video until first interaction to avoid blocking LCP
      const loadVideo = () => setShouldLoadVideo(true)
      window.addEventListener('touchstart', loadVideo, { once: true, passive: true })
      window.addEventListener('scroll', loadVideo, { once: true, passive: true })
      return () => {
        window.removeEventListener('touchstart', loadVideo)
        window.removeEventListener('scroll', loadVideo)
      }
    } else {
      // On desktop load video immediately
      setShouldLoadVideo(true)
    }
  }, [])

  function onVideoMeta(e: React.SyntheticEvent<HTMLVideoElement>) {
    const v = e.currentTarget
    if (!v.videoWidth || !v.videoHeight) return
    setVideoAspectRatio(`${v.videoWidth} / ${v.videoHeight}`)
    setIsVerticalVideo(v.videoHeight > v.videoWidth)
  }

  const h1FontFamily = organization?.fonts?.h1
    ? `${organization.fonts.h1}, Poppins-fallback, Arial, sans-serif`
    : undefined

  return (
    <div className="relative min-h-[750px] overflow-hidden md:min-h-[750px]">
      {/* Transparent bg image - mobile only */}
      <div className="absolute inset-0 block md:hidden">
        {bgUrl && (
          <Image
            src={bgUrl}
            alt={headline || 'Background image'}
            fill
            className="object-cover object-top-left brightness-50"
            priority
          />
        )}
      </div>

      {/* Main background section */}
      <div className="relative min-h-[750px] w-full flex items-center bg-gray-500">
        {bgUrl && (
          <Image
            src={bgUrl}
            alt={headline || 'Main background image'}
            fill
            className="object-cover object-top-left z-0 hidden md:block"
            priority
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50 z-10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-20 w-[85%] mx-auto py-8">
          <div className="flex justify-center">
            <div className="flex flex-col md:flex-row w-full max-w-[1185px] gap-6">
              {/* Left content */}
              <div className="w-full md:w-1/2">
                <div className="h-full break-words">
                  <h1
                    className="text-white text-[30px] md:text-[50px] leading-none mb-4"
                    style={{ fontFamily: h1FontFamily }}
                  >
                    {headline}
                  </h1>
                  {content && (
                    <div
                      className="text-white text-base md:text-lg"
                      dangerouslySetInnerHTML={{ __html: content ?? '' }}
                    />
                  )}
                  {bulletList.length > 0 && (
                    <div className="pt-4">
                      {bulletList.map((bullet, i) => (
                        <ul key={i} className="pl-5 list-none">
                          <li className="flex items-center mb-2">
                            <span className="text-white text-2xl -ml-6 mr-2">&#8594;</span>
                            <p
                              className="text-white ml-2 m-0"
                              dangerouslySetInnerHTML={{ __html: typeof bullet === 'string' ? bullet : '' }}
                            />
                          </li>
                        </ul>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right media */}
              {rightMedia && (
                <div className="w-full md:w-1/2">
                  <div
                    ref={videoWrapperRef}
                    className={`relative min-h-[250px] md:min-h-[427px] ${isVerticalVideo ? 'max-w-[600px] mx-auto' : ''}`}
                  >
                    {!isVideo ? (
                      <Image
                        src={buildMediaUrl(rightMedia, 800)}
                        alt={headline || 'Media content'}
                        width={600}
                        height={427}
                        className="w-full h-auto block"
                        priority
                      />
                    ) : shouldLoadVideo ? (
                      <video
                        ref={videoRef}
                        aria-label={headline || 'Video content'}
                        style={{ aspectRatio: videoAspectRatio }}
                        preload="none"
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-auto block object-contain"
                        onLoadedMetadata={onVideoMeta}
                      >
                        <source src={mediaUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <div
                        className="w-full bg-black/30"
                        style={{ aspectRatio: '1000 / 712' }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
