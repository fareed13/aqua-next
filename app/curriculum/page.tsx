import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { CurriculumDefault } from '@/components/curriculum/CurriculumDefault'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({ org, domain, pageName: 'curriculum', path: '/curriculum' })
}

export default async function CurriculumPage() {
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]
  const location = organization.locations[0]
  const curriculumList = location.curriculums ?? []

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Curriculum" />
      {curriculumList.length > 0 && (
        <CurriculumDefault curriculumList={curriculumList} />
      )}
    </div>
  )
}
