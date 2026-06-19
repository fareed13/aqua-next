import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { ServiceIntroAddEdit } from '@/components/admin/serviceIntro/ServiceIntroAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function ServiceIntroEditPage({ params }: PageProps) {
  const { slug } = await params
  const introId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="ServiceIntro Add/Edit" />
      <ServiceIntroAddEdit introId={introId} />
    </div>
  )
}
