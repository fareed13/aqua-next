'use client'

import { useState } from 'react'
import { FeedPostTop } from './FeedPostTop'
import { FeedPostBottom } from './FeedPostBottom'
import { InstaSingleImg } from './InstaSingleImg'
import { InstaVideo } from './InstaVideo'

interface InstaSliderProps {
  likes: number
  postFeed: any
  profile: any
}

export function InstaSlider({ likes, postFeed, profile }: InstaSliderProps) {
  const children: any[] = postFeed?.children?.data ?? []
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = children.length

  const prev = () => setCurrentSlide(s => Math.max(0, s - 1))
  const next = () => setCurrentSlide(s => Math.min(totalSlides - 1, s + 1))

  const thumbnailUrl =
    postFeed?.media_type === 'CAROUSEL_ALBUM' || postFeed?.media_type === 'IMAGE'
      ? postFeed?.media_url
      : postFeed?.thumbnail_url

  return (
    <div className="border-0">
      <FeedPostTop
        profile_image={profile.profile_image}
        full_name={profile.full_name}
        page_url={profile.page_url}
        permalink={postFeed?.permalink ?? ''}
      />

      {/* Carousel */}
      <div className="relative overflow-hidden" aria-label="Instagram carousel post">
        {totalSlides > 0 && (
          <div>
            {(() => {
              const item = children[currentSlide]
              if (!item) return null
              if (item.media_type === 'VIDEO') {
                return (
                  <InstaVideo
                    url={item.media_url}
                    postFeed={item}
                    likes={0}
                    showOnlyContent
                    profile={profile}
                  />
                )
              }
              return (
                <InstaSingleImg
                  url={item.media_url}
                  postFeed={item}
                  likes={0}
                  showOnlyContent
                  profile={profile}
                />
              )
            })()}
          </div>
        )}

        {/* Prev / Next arrows */}
        {totalSlides > 1 && (
          <>
            <button
              onClick={prev}
              disabled={currentSlide === 0}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-30 hover:bg-black/60 transition"
              aria-label="Previous image"
            >
              &#8249;
            </button>
            <button
              onClick={next}
              disabled={currentSlide === totalSlides - 1}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center disabled:opacity-30 hover:bg-black/60 transition"
              aria-label="Next image"
            >
              &#8250;
            </button>
          </>
        )}

        {/* Dot indicators */}
        {totalSlides > 1 && (
          <div className="flex justify-center gap-1 py-1.5">
            {children.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? 'bg-white' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      <FeedPostBottom
        likes={likes}
        profile_image={profile.profile_image}
        full_name={profile.full_name}
        page_url={profile.page_url}
        caption={postFeed?.caption ?? ''}
        date={postFeed?.timestamp ?? ''}
        thumbnail={thumbnailUrl ?? ''}
      />
    </div>
  )
}
