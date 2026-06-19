import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { ForgotPassword } from '@/components/auth/ForgotPassword'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const domain = getDomain()
  const org = (await fetchOrganization(domain))[0]
  return buildPageMetadata({
    org, domain, pageName: 'login-slug', pageSlug: slug, path: `/login/${slug}`,
  })
}

export default async function ForgotPasswordPage() {
  return <ForgotPassword />
}
