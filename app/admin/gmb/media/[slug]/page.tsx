import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { GmbMediaAddEdit } from '@/components/admin/gmb/GmbMediaAddEdit'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function GmbMediaPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Add GMB Post" />
      <GmbMediaAddEdit />
    </div>
  )
}
