'use client'

import { useState, useEffect, useRef } from 'react'
import { FeedPostTop } from './FeedPostTop'
import { FeedPostBottom } from './FeedPostBottom'

interface InstaVideoProps {
  url: string
  postFeed: any
  likes?: number
  showOnlyContent: boolean
  profile?: any
}

export function InstaVideo({ url, postFeed, likes = 0, showOnlyContent, profile }: InstaVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isWide, setIsWide] = useState(false)

  useEffect(() => {
    const checkWidth = () => setIsWide(window.innerWidth > 768)
    checkWidth()
    window.addEventListener('resize', checkWidth)
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
    } else {
      videoRef.current.pause()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !videoRef.current.muted
    setIsMuted(videoRef.current.muted)
  }

  const thumbnailUrl =
    postFeed?.media_type === 'CAROUSEL_ALBUM' || postFeed?.media_type === 'IMAGE'
      ? postFeed?.media_url
      : postFeed?.thumbnail_url

  return (
    <div className="border-0">
      {!showOnlyContent && profile && (
        <FeedPostTop
          profile_image={profile.profile_image}
          full_name={profile.full_name}
          page_url={profile.page_url}
          permalink={postFeed?.permalink ?? ''}
        />
      )}

      <div className="relative w-full bg-black overflow-hidden group">
        <video
          ref={videoRef}
          src={url}
          loop
          playsInline
          preload="auto"
          poster={postFeed?.thumbnail_url}
          aria-label={postFeed?.caption?.slice(0, 100) || 'Instagram video post'}
          className="w-full h-auto"
          onClick={isWide ? togglePlay : undefined}
        />

        {/* Mute control — visible on hover (desktop only) */}
        {isWide && (
          <div className="absolute bottom-2 left-0 right-0 px-2 flex items-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={toggleMute}
              className="text-white text-sm px-2 py-1 rounded cursor-pointer"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        )}
      </div>

      {!showOnlyContent && profile && (
        <FeedPostBottom
          likes={likes}
          profile_image={profile.profile_image}
          full_name={profile.full_name}
          page_url={profile.page_url}
          caption={postFeed?.caption ?? ''}
          date={postFeed?.timestamp ?? ''}
          thumbnail={thumbnailUrl ?? ''}
        />
      )}
    </div>
  )
}
