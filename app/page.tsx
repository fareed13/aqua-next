import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]
  const location = organization.locations[0]
  const homepage = location.pages.find((p) => p.slug === 'homepage')

  return {
    title: homepage?.title ?? organization.name,
    description: homepage?.description ?? '',
  }
}

export default async function HomePage() {
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]
  const location = organization.locations[0]

  // Find homepage from location.pages — same slug as Nuxt
  const homepage = location.pages.find((p) => p.slug === 'homepage')

  if (!homepage?.content?.length) {
    return null
  }

  return (
    <>
      {homepage.content.map((section, i) => (
        <SectionRenderer key={`${section.component}-${i}`} section={section} />
      ))}
    </>
  )
}
