import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { FaqAddEdit } from '@/components/admin/faq/FaqAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function FaqEditPage({ params }: PageProps) {
  const { slug } = await params
  const faqId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="FAQ Add/Edit" />
      <FaqAddEdit faqId={faqId} />
    </div>
  )
}
