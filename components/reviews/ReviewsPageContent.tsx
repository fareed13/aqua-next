'use client'

import { useOrgStore } from '@/store/orgStore'
import { ReviewsDefault } from './ReviewsDefault'
import { ReviewsSplash } from './ReviewsSplash'
import { PopupFormReview } from '@/components/popupForm/PopupFormReview'
import { useAuth } from '@/hooks/useAuth'

export function ReviewsPageContent() {
  const organization = useOrgStore(s => s.organization)
  const { isMemberLoggedIn } = useAuth()

  const reviews = organization?.org_reviews ?? []

  return (
    <div>
      {isMemberLoggedIn() && <PopupFormReview />}
      {reviews.length > 0
        ? <ReviewsDefault component="ReviewsDefault" />
        : (
          <div className="py-24 text-center text-gray-500">
            No reviews yet.
          </div>
        )
      }
    </div>
  )
}
