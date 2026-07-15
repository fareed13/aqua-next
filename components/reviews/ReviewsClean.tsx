'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { ReactElement } from 'react'
import { PlusCircle } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useReviews } from '@/hooks/useReviews'
import { ReviewsAddEdit } from './ReviewsAddEdit'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'

interface ReviewsCleanProps {
  countOfReviews?: number
}

const SOCIAL_SVG: Record<string, ReactElement> = {
  google: (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="#2783ef"><path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.14 3.17-7.27 7.24-7.27 3.05 0 4.83 1.94 4.83 1.94l2-2C17.99 3.23 15.76 2 12.24 2 6.05 2 2 6.58 2 12s4.05 10 10.24 10c5.65 0 9.36-3.87 9.36-9.6 0-.64-.05-1.2-.25-2.3z"/></svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="#2783ef"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88V14.89h-2.54V12h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99C18.34 21.12 22 17 22 12z"/></svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="#2783ef"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
  ),
  twitter: (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="#2783ef"><path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/></svg>
  ),
  linkedin: (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="#2783ef"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" width="25" height="25" fill="#2783ef"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
  ),
}

const VISIBLE_COUNT = 3

function getSocialIcon(platform?: string): ReactElement {
  if (!platform) return SOCIAL_SVG.default
  return SOCIAL_SVG[platform.toLowerCase()] ?? SOCIAL_SVG.default
}

function ChevronLeft({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z" />
    </svg>
  )
}

function ChevronRight({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
    </svg>
  )
}

// Material (filled) icons — same family and metrics so the pair reads uniform
const MDI_PATHS = {
  pencil: 'M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z',
  trash: 'M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19V4M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z',
} as const

function MdiIcon({ path, size = 19 }: { path: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d={path} />
    </svg>
  )
}

// Compact, professional-looking admin icon buttons for review cards
function ReviewAdminActions({
  name,
  onEdit,
  onDelete,
}: {
  name: string
  onEdit: () => void
  onDelete: () => void
}) {
  const btnBase =
    'inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1'
  return (
    <div className="flex justify-center gap-0.5 mt-2">
      <button
        type="button"
        onClick={onEdit}
        className={`${btnBase} text-gray-500 hover:text-gray-800 hover:bg-gray-200/70 focus-visible:ring-gray-400`}
        aria-label={`Edit review by ${name}`}
        title="Edit review"
      >
        <MdiIcon path={MDI_PATHS.pencil} />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className={`${btnBase} text-red-700 hover:text-red-800 hover:bg-red-100/80 focus-visible:ring-red-500`}
        aria-label={`Delete review by ${name}`}
        title="Delete review"
      >
        <MdiIcon path={MDI_PATHS.trash} />
      </button>
    </div>
  )
}

function Stars({ rating, size = 25 }: { rating: any; size?: number }) {
  const stars = rating ? Math.round(Number(rating)) : 0
  return (
    <div className="flex justify-center mb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < stars ? 'orange' : 'grey', fontSize: size }}>★</span>
      ))}
    </div>
  )
}

export function ReviewsClean({ countOfReviews }: ReviewsCleanProps) {
  const organization = useOrgStore(s => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#d5242c'
  const country = organization?.country?.toLowerCase() ?? ''
  const isEuroDate = country.includes('uk') || country.includes('gb') || country.includes('australia') || country.includes('new zealand')

  // Admin add/edit/delete controls (ported from Nuxt ReviewsClean.vue)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const {
    editPopup,
    selectedReview,
    deletePopup,
    toggleDeletePopup,
    toggleEditPopup,
    checkUserRole,
    deleteReview,
  } = useReviews()
  const [removedIds, setRemovedIds] = useState<number[]>([])
  const isAdmin = mounted && checkUserRole()

  const handleConfirmDelete = useCallback(async () => {
    const id = selectedReview?.id
    await deleteReview()
    if (id) setRemovedIds(ids => [...ids, id])
  }, [selectedReview, deleteReview])

  const allReviews = (organization?.org_reviews ?? []).filter(r => !removedIds.includes(r.id))
  // Nuxt's ReviewsClean.vue calls useReviews() with no props, so the composable's
  // `slice(0, props.count_of_reviews ?? 6)` always caps it at 6. Falling back to
  // the unsliced list here showed every org review on class pages instead.
  // The /reviews page still opts out by passing countOfReviews={100}.
  const reviews = allReviews.slice(0, countOfReviews ?? 6)

  const [activeSlide, setActiveSlide] = useState(0)
  const [readMore, setReadMore] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  // Paged window like Nuxt's v-slide-group: 3 cards visible, each next/prev
  // click advances a full page (reviews 1-3 -> 4-6). Clamp at bounds, no wrap.
  const maxStart = Math.max(0, reviews.length - VISIBLE_COUNT)

  const goToStart = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(maxStart, index))
    setCurrentIndex(clamped)
    const card = cardRefs.current[clamped]
    const container = scrollRef.current
    if (card && container) {
      // Measure on the triggering event and left-align the start card.
      const cardRect = card.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      container.scrollBy({ left: cardRect.left - containerRect.left, behavior: 'smooth' })
    }
  }, [maxStart])

  if (!reviews.length && !isAdmin) return null

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return isEuroDate
      ? d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long' })
      : d.toLocaleDateString('en-US', { month: 'long', day: '2-digit' })
  }

  const truncatedContent = (content: string, truncate: boolean) => {
    const wordLimit = 10
    const words = content.split(' ')
    if (truncate && words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...'
    }
    return content
  }

  const changeButtonClass = (index: number) => {
    if (selectedIndex === index) {
      setReadMore(r => !r)
    } else {
      setReadMore(true)
      setSelectedIndex(index)
    }
  }

  const isScaled = (i: number) => i % 3 === 1

  return (
    <div className="py-[70px] pb-[100px]">
      {isAdmin && (
        <div className="w-full mb-6">
          <ReviewsAddEdit
            popup={editPopup}
            review={selectedReview}
            onToggleEditPopup={() => toggleEditPopup(null)}
          />
          <DeleteWarning
            popup={deletePopup}
            onConfirm={handleConfirmDelete}
            onCancel={() => toggleDeletePopup(null)}
            loading={false}
            message="Are you sure you want to delete this review?"
          />
          <div className="text-center">
            <button
              type="button"
              onClick={() => toggleEditPopup('new')}
              className="inline-flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: accentColor }}
            >
              <PlusCircle size={16} />
              Add Review (admin)
            </button>
          </div>
        </div>
      )}
      <div className="max-w-[1080px] mx-auto px-4">
        <h2 className="capitalize text-center text-2xl md:text-3xl font-medium text-black mb-10">
          Hear what our members are saying
        </h2>

        {/* Desktop: arrows sit outside the scroll container as flex siblings */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => goToStart(currentIndex - VISIBLE_COUNT)}
            disabled={currentIndex === 0}
            className="shrink-0 text-black disabled:opacity-30 leading-none"
            aria-label="Previous review"
          >
            <ChevronLeft size={60} />
          </button>

          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto flex items-center py-14 hide-scrollbar"
          >
            {reviews.map((review: any, i: number) => {
              const isExpanded = readMore && selectedIndex === i
              const scaled = isScaled(i)
              return (
                <div
                  key={i}
                  ref={(el) => { cardRefs.current[i] = el }}
                  className="shrink-0 relative text-center border border-[#aaa] bg-[#eee] p-5"
                  style={{
                    width: 267,
                    minHeight: 331,
                    margin: scaled ? '0 55px 23px 55px' : '0 30px',
                    transform: scaled ? 'scale(1.3)' : undefined,
                    boxShadow: scaled ? '1px 1px 5px #ccc' : undefined,
                    zIndex: scaled ? 9 : undefined,
                  }}
                >
                  <Stars rating={review.rating} />
                  <p
                    className="pt-[3px] text-[#0e0e0e] text-[13px] whitespace-normal break-words mb-0"
                    style={!isExpanded ? {
                      display: '-webkit-box',
                      WebkitLineClamp: 5,
                      WebkitBoxOrient: 'vertical' as const,
                      overflow: 'hidden',
                    } : {}}
                  >
                    {review.content}
                  </p>
                  {/* Vuetify v-btn (elevated) look: white bg, elevation-2 shadow,
                      rounded, medium weight + letter-spacing; card scss pins
                      height 18px / font 9px / no padding-y. */}
                  <button
                    onClick={() => changeButtonClass(i)}
                    className="capitalize text-[#0e0e0e] cursor-pointer text-[9px] h-[18px] px-2 my-1 inline-flex items-center justify-center rounded bg-white font-medium tracking-wider shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),0_2px_2px_0_rgba(0,0,0,0.14),0_1px_5px_0_rgba(0,0,0,0.12)]"
                    aria-label={isExpanded ? 'Collapse review text' : 'Read more review text'}
                  >
                    {isExpanded ? 'Collapse' : 'Read More'}
                  </button>
                  <strong className="block mb-2 text-sm">{review.name}</strong>
                  <h4 className="text-[#0e0e0e] mb-[14px]" style={{ fontSize: 16 }}>
                    {formatDate(review.date_created || review.created_at)}
                  </h4>
                  <span className="flex justify-center">
                    {getSocialIcon(review.platform ?? undefined)}
                  </span>
                  {isAdmin && (
                    <ReviewAdminActions
                      name={review.name}
                      onEdit={() => toggleEditPopup(review)}
                      onDelete={() => toggleDeletePopup(review)}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <button
            onClick={() => goToStart(currentIndex + VISIBLE_COUNT)}
            disabled={currentIndex >= maxStart}
            className="shrink-0 text-black disabled:opacity-30 leading-none"
            aria-label="Next review"
          >
            <ChevronRight size={60} />
          </button>
        </div>

        {/* Mobile: carousel with prev/next icon buttons — hidden on desktop */}
        <div className="md:hidden">
          {reviews.length > 0 && (
            <div className="relative">
              <div className="bg-[#eee] border border-[#aaa] text-center p-5 min-h-[331px] flex flex-col items-center">
                {(() => {
                  const review = reviews[activeSlide]
                  const isExpanded = readMore && selectedIndex === activeSlide
                  return (
                    <>
                      <Stars rating={review.rating} size={20} />
                      <div
                        className="text-[#0e0e0e] text-sm mb-2 flex-1"
                        dangerouslySetInnerHTML={{
                          __html: truncatedContent(review.content || '', !isExpanded),
                        }}
                      />
                      {/* Nuxt .mobile-readmore: default v-btn (elevated, uppercase,
                          36px tall) forced to 100px wide, centered. */}
                      <button
                        onClick={() => changeButtonClass(activeSlide)}
                        className="w-[100px] h-9 mb-2 mx-auto inline-flex items-center justify-center rounded bg-white uppercase text-xs font-medium tracking-wider whitespace-nowrap cursor-pointer shadow-[0_3px_1px_-2px_rgba(0,0,0,0.2),0_2px_2px_0_rgba(0,0,0,0.14),0_1px_5px_0_rgba(0,0,0,0.12)]"
                        aria-label={isExpanded ? 'Collapse review text' : 'Read more review text'}
                      >
                        {isExpanded ? 'Collapse' : 'Read More'}
                      </button>
                      <strong className="block mb-1 text-sm">{review.name}</strong>
                      <h4 className="text-sm text-[#0e0e0e] mb-3">
                        {formatDate(review.date_created || review.created_at)}
                      </h4>
                      <span className="flex justify-center mb-5 text-[#2783ef]">
                        {getSocialIcon(review.platform ?? undefined)}
                      </span>
                      {isAdmin && (
                        <ReviewAdminActions
                          name={review.name ?? ''}
                          onEdit={() => toggleEditPopup(review)}
                          onDelete={() => toggleDeletePopup(review)}
                        />
                      )}
                    </>
                  )
                })()}
              </div>

              <div className="flex justify-between mt-4">
                {/* Prev — green elevated icon button matching Nuxt color="success" */}
                <button
                  onClick={() => { setActiveSlide(p => Math.max(0, p - 1)); setSelectedIndex(null) }}
                  disabled={activeSlide === 0}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-green-600 text-white shadow disabled:opacity-40"
                  aria-label="Previous review"
                >
                  <ChevronLeft size={28} />
                </button>

                <span className="text-sm text-gray-500 self-center">
                  {activeSlide + 1} / {reviews.length}
                </span>

                {/* Next — blue elevated icon button matching Nuxt color="info" */}
                <button
                  onClick={() => { setActiveSlide(p => Math.min(reviews.length - 1, p + 1)); setSelectedIndex(null) }}
                  disabled={activeSlide === reviews.length - 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 text-white shadow disabled:opacity-40"
                  aria-label="Next review"
                >
                  <ChevronRight size={28} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
