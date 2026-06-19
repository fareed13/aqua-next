import { fetchOrganization } from '@/lib/api/serverInit'
import { getDomain } from '@/lib/utils/getDomain'
import { buildPageMetadata } from '@/lib/utils/metaTags'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { LessonDetail } from '@/components/curriculum/LessonDetail'
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
    pageName: 'curriculum-lesson',
    pageSlug: slug,
    path: `/curriculum/lesson/${slug}`,
  })
}

export default async function LessonDetailPage({ params }: PageProps) {
  const { slug } = await params
  const domain = getDomain()
  const data = await fetchOrganization(domain)
  const organization = data[0]
  const location = organization.locations[0]

  const allLessons = (location.curriculums ?? []).flatMap(
    (cur: any) => cur.lessons ?? []
  )
  const lesson = allLessons.find((l: any) => String(l.id) === slug)

  if (!lesson) {
    notFound()
  }

  return (
    <div>
      <LandingPageBanner component="LandingPageBanner" headline={lesson.name} />
      <LessonDetail lesson={lesson} />
    </div>
  )
}
