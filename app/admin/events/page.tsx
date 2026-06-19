import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { EventList } from '@/components/admin/events/EventList'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function EventsPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Event Add/Edit" />
      <EventList />
    </div>
  )
}
