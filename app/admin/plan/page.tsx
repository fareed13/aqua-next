import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { PlanList } from '@/components/admin/plan/PlanList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function PlansPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Plans" />
      <PlanList />
    </div>
  )
}
