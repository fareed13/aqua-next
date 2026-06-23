import { fetchDynamicRoutes } from '@/lib/api/serverInit'
import { PdfViewer } from '@/components/pdf/PdfViewer'

export async function generateStaticParams() {
  const routes = await fetchDynamicRoutes()
  return routes
    .filter(r => /^\/pdf\/[^/]+$/.test(r))
    .map(r => ({ slug: r.split('/')[2] }))
}

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PdfPage({ params }: PageProps) {
  const { slug } = await params

  return (
    <div className="mt-[80px] max-[767px]:mt-[148px]">
      <PdfViewer slug={slug} />
    </div>
  )
}
