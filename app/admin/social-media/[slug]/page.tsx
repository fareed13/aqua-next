import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { SocialMediaAddEdit } from '@/components/admin/socialMedia/SocialMediaAddEdit'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default async function SocialMediaEditPage({ params }: PageProps) {
  const { slug } = await params
  const socialId = slug !== 'new' ? slug : undefined

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Social Media Add/Edit" />
      <SocialMediaAddEdit socialId={socialId} />
    </div>
  )
}
