import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { AdLibraryAddEdit } from '@/components/admin/adLibrary/AdLibraryAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AdLibraryEditPage({ params }: PageProps) {
  const { slug } = await params
  const adId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Ad Library Add/Edit" />
      <AdLibraryAddEdit adId={adId} />
    </div>
  )
}
