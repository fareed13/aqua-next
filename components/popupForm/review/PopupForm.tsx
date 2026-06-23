'use client'

import { useState, useEffect } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

export function PopupForm() {
  const organization = useOrgStore((s) => s.organization)
  const setReviewDialog = useUiStore((s) => s.setReviewDialog)

  const [rating, setRating] = useState<number>(3)
  const [review, setReview] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    setIsMobile(window.innerWidth < 800)
  }, [])

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#1976D2'
  const darkerBg = organization?.colors?.['app-darker-background'] ?? '#000000'

  function closeReview() {
    setReviewDialog(false)
  }

  function saveReview() {
    setLoading(true)
    // Stub: real implementation would POST to an API here
    setTimeout(() => {
      setLoading(false)
      closeReview()
    }, 1000)
  }

  return (
    <div style={{ marginBottom: isMobile ? '200px' : '0', position: 'relative' }}>
      {/* Close button */}
      <button
        className="absolute top-0 right-0 z-10 text-xl"
        onClick={closeReview}
        aria-label="Close"
      >
        &times;
      </button>

      <h4 className="mt-3 text-left text-black uppercase">
        LEAVE A RATING AND A REVIEW
      </h4>

      {/* Star rating */}
      <div className="mt-3">
        <label className="block mb-1 font-medium">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              style={{ color: star <= rating ? accentColor : undefined }}
              className="text-2xl leading-none focus:outline-none"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              {star <= rating ? '★' : '☆'}
            </button>
          ))}
        </div>
      </div>

      {/* Review textarea */}
      <div className="mt-3">
        <label className="block mb-1 font-medium">Review</label>
        <textarea
          className="form-control bg-gray-100 w-full border border-gray-300 rounded p-2"
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />
      </div>

      {/* Save button */}
      <button
        type="button"
        className="mt-4 w-full text-white py-2 rounded"
        style={{ background: darkerBg }}
        onClick={saveReview}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </div>
  )
}
