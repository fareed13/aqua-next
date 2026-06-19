import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { EventAddEdit } from '@/components/admin/events/EventAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function EventEditPage({ params }: PageProps) {
  const { slug } = await params
  const eventId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Event Add/Edit" />
      <EventAddEdit eventId={eventId} />
    </div>
  )
}
