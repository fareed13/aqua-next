import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { RedirectAddEdit } from '@/components/admin/redirectUrl/RedirectAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function RedirectEditPage({ params }: PageProps) {
  const { slug } = await params
  const redirectId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Redirect URL Add/Edit" />
      <RedirectAddEdit redirectId={redirectId} />
    </div>
  )
}
