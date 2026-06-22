import { fetchOrganization, fetchDynamicRoutes } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { BlogDetail } from '@/components/blog/BlogDetail'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  const routes = await fetchDynamicRoutes()
  return routes
    .filter(r => /^\/blog\/[^/]+$/.test(r))
    .map(r => ({ slug: r.split('/')[2] }))
}

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
    pageName: 'blog-slug',
    pageSlug: slug,
    path: `/blog/${slug}`,
  })
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]
  const location = organization.locations[0]

  const blogId = parseInt(slug.split('-').pop() || '', 10)
  const blog = location.blogs?.find((b) => b.id === blogId)

  if (!blog) {
    notFound()
  }

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline={blog.title || 'Blog'} />
      <BlogDetail blog={blog} />
    </div>
  )
}
