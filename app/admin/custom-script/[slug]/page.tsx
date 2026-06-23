import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function CustomScriptPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Add Script" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border rounded shadow-sm p-6">
          <h2 className="text-xl font-bold mb-4">Custom Script</h2>
          <p className="text-gray-500">CustomScriptAddEdit component will be rendered here.</p>
        </div>
      </div>
    </div>
  )
}
