import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { AllSettings } from '@/components/admin/settings/AllSettings'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AllSettingsPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="All Settings" />
      <AllSettings />
    </div>
  )
}
