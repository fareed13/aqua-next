import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata, buildProductSchemas } from '@/lib/utils/metaTags'
import { ServiceDetail } from '@/components/service/ServiceDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

const KIDS_SLUGS = ['kids-karate', 'kids-krav-maga', 'kids-martial-arts', 'kids-taekwondo', 'kids-kung-fu']

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({
    org,
    domain,
    pageName: 'classes-slug',
    pageSlug: slug.toLowerCase(),
    serviceSlug: slug.toLowerCase(),
    path: `/classes/${slug.toLowerCase()}`,
  })
}

export default async function ClassesSlugPage({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = slug.toLowerCase()
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]
  const services = organization.services ?? []

  let service
  let serviceName: string

  if (KIDS_SLUGS.includes(normalizedSlug)) {
    service = services.find(s => s.name.startsWith('Kids'))
    serviceName = normalizedSlug.replace(/-/g, ' ')
  } else {
    service = services.find(s => s.slug === normalizedSlug)
    serviceName = service?.name ?? ''
  }

  if (!service) {
    notFound()
  }

  return (
    <>
      <ServiceDetail service={service} serviceName={serviceName} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildProductSchemas(organization, domain, normalizedSlug)),
        }}
      />
    </>
  )
}
