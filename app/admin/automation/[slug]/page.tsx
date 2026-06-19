import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function AutomationEditPage({ params }: PageProps) {
  const { slug } = await params
  const automationId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Automation Add/Edit" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border rounded shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">
            {automationId ? `Edit Automation #${automationId}` : 'New Automation'}
          </h2>
          <p className="text-gray-500">AutomationAddEdit component will be rendered here.</p>
        </div>
      </div>
    </div>
  )
}
