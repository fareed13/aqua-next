import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { UserAddEdit } from '@/components/admin/user/UserAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function UserEditPage({ params }: PageProps) {
  const { slug } = await params
  const userId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="User Add/Edit" />
      <UserAddEdit userId={userId} />
    </div>
  )
}
