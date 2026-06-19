import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { PageAdd } from '@/components/admin/landingpageBuilder/PageAdd'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function LandingPageBuilderPage({ params }: PageProps) {
  const { slug } = await params
  const pageId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Create a landing page" />
      <PageAdd pageId={pageId} />
    </div>
  )
}
