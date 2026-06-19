import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { InstructorDetail } from '@/components/instructor/InstructorDetail'
import { buildMediaUrl } from '@/lib/utils/media'
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
    pageName: 'instructors-slug',
    pageSlug: slug,
    path: `/instructors/${slug}`,
  })
}

export default async function InstructorDetailPage({ params }: PageProps) {
  const { slug } = await params
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]

  const instructor = (organization.staffs ?? []).find(
    s => s.slug.toLowerCase() === slug.toLowerCase()
  )

  if (!instructor) {
    notFound()
  }

  const imageUrl = instructor.media ? buildMediaUrl(instructor.media, 350) : ''
  const canonicalDomain = (organization.canonical_domain || domain)
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')

  const personSchema = {
    '@context': 'http://schema.org',
    '@type': 'Person',
    image: imageUrl,
    name: instructor.name,
    jobTitle: 'Martial Arts Instructor',
    url: `https://${canonicalDomain}/instructors/${slug}`,
  }

  return (
    <>
      <LandingPageBanner
        component="LandingPageBanner"
        headline={instructor.name}
        backgroundImage={imageUrl}
      />
      <InstructorDetail instructor={instructor} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
    </>
  )
}
