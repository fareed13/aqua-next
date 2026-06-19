import { AdminDashboard } from '@/components/admin/dashboard/AdminDashboard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DashboardPage() {
  return <AdminDashboard />
}
