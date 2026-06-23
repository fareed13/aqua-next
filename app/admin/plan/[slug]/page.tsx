import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { PlanAddEdit } from '@/components/admin/plan/PlanAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function PlanEditPage({ params }: PageProps) {
  const { slug } = await params
  const planId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Plan Add/Edit" />
      <PlanAddEdit planId={planId} />
    </div>
  )
}
