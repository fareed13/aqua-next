import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { BookedAppointments } from '@/components/admin/bookings/BookedAppointments'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function BookingsPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Booked Appointments" />
      <BookedAppointments />
    </div>
  )
}
