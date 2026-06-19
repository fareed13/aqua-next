import { PdfViewer } from '@/components/pdf/PdfViewer'

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
