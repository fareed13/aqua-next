import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { ProgramDefault } from '@/components/programBlocks/ProgramDefault'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({ org, domain, pageName: 'classes', path: '/classes' })
}

export default async function ClassesPage() {
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]

  const headlineFromMeta = organization.services?.length
    ? 'Classes'
    : 'Classes'

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline={headlineFromMeta} />
      <ProgramDefault component="ProgramDefault" />
    </div>
  )
}
