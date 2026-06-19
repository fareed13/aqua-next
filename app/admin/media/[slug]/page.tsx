import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { MediaAddEdit } from '@/components/admin/media/MediaAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function MediaEditPage({ params }: PageProps) {
  const { slug } = await params
  const mediaId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Media Add/Edit" />
      <MediaAddEdit mediaId={mediaId} />
    </div>
  )
}
