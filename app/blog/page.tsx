import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { BlogList } from '@/components/blog/BlogList'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({ org, domain, pageName: 'blog', path: '/blog' })
}

export default async function BlogPage() {
  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline="Blog" />
      <BlogList />
    </div>
  )
}
