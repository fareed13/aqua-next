import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { PdfAdd } from '@/components/admin/pdfBuilder/PdfAdd'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function PdfBuilderPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Create PDF" />
      <PdfAdd />
    </div>
  )
}
