import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { ReviewApproval } from '@/components/admin/reviewApproval/ReviewApproval'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function ReviewApprovalPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Reputation Management" />
      <ReviewApproval />
    </div>
  )
}
