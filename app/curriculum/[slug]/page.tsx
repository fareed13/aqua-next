import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { CurriculumDetail } from '@/components/curriculum/CurriculumDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({
    org,
    domain,
    pageName: 'curriculum-slug',
    pageSlug: slug,
    path: `/curriculum/${slug}`,
  })
}

export default async function CurriculumDetailPage({ params }: PageProps) {
  const { slug } = await params
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]
  const location = organization.locations[0]

  const curriculum = (location.curriculums ?? []).find(
    (c) => String(c.id) === slug
  )

  if (!curriculum) {
    notFound()
  }

  return <CurriculumDetail curriculum={curriculum} />
}
