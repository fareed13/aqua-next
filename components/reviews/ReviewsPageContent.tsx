'use client'

import { useState, useEffect } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { ReviewsClean } from './ReviewsClean'
import { PageEdit } from '@/components/pages/PageEdit'
import { PopupFormReview } from '@/components/popupForm/PopupFormReview'
import { useAuth } from '@/hooks/useAuth'
import type { Review, Page } from '@/types/api'

interface Props {
  initialReviews?: Review[]
  /** The reviews Page entity, when it exists — enables the Edit/Delete Page controls. */
  page?: Page
}

export function ReviewsPageContent({ initialReviews = [], page }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const orgReviews = useOrgStore(s => s.organization?.org_reviews)
  const { isMemberLoggedIn, isAdminLoggedIn } = useAuth()

  // Use store data once hydrated, fall back to server-passed data for SSR
  const reviews = orgReviews ?? initialReviews

  return (
    <div>
      {/* Edit Page / Delete Page controls — same PageEdit used by DynamicPage */}
      {mounted && isAdminLoggedIn() && page && (
        <PageEdit page={page} sections={page.content ?? []} />
      )}
      {/* Defer auth-dependent UI to avoid SSR mismatch */}
      {mounted && isMemberLoggedIn() && <PopupFormReview />}
      {reviews.length > 0 || (mounted && isAdminLoggedIn())
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
