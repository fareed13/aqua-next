'use client'

import { useState, useEffect } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { ReviewsClean } from './ReviewsClean'
import { PopupFormReview } from '@/components/popupForm/PopupFormReview'
import { useAuth } from '@/hooks/useAuth'
import type { Review } from '@/types/api'

interface Props {
  initialReviews?: Review[]
}

export function ReviewsPageContent({ initialReviews = [] }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const orgReviews = useOrgStore(s => s.organization?.org_reviews)
  const { isMemberLoggedIn } = useAuth()

  // Use store data once hydrated, fall back to server-passed data for SSR
  const reviews = orgReviews ?? initialReviews

  return (
    <div>
      {/* Defer auth-dependent UI to avoid SSR mismatch */}
      {mounted && isMemberLoggedIn() && <PopupFormReview />}
      {reviews.length > 0
        ? <ReviewsClean countOfReviews={100} />
        : (
          <div className="py-24 text-center text-gray-500">
            No reviews yet.
          </div>
        )
      }
    </div>
  )
}
