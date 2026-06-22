import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'

export function VirtualClass({ headline, content }: SectionProps) {
  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
  const zoomLogoUrl = `${mediaBase}/zoomLogo.png`

  return (
    <div className="bg-[#f3f3f3] py-12 text-center">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="mb-3 text-[30px]">
          {headline || 'Class Begins at:'}
        </h3>

        <div className="w-full max-w-[600px] mx-auto mb-8">
          <div className="flex flex-wrap justify-around gap-4">
            <div className="text-center">
              <h2 className="text-[70px] leading-[0.9] text-[#3d3d3d]">4:15 PM</h2>
              <h4 className="text-[36px] text-[#3d3d3d]">Tuesdays</h4>
            </div>
          </div>
        </div>

        <p className="text-[#3d3d3d] text-lg">
          {content || 'Click the logo below at the time above to join the class LIVE'}
        </p>

        <div className="max-w-[380px] mx-auto mt-4">
          <Image
            src={zoomLogoUrl}
            alt="Zoom logo"
            width={380}
            height={100}
            className="w-full border-[3px] border-black object-contain"
            loading="lazy"
          />
        </div>

        <p className="mt-5 text-[#3d3d3d] text-lg">Meeting ID 624-070-356</p>
      </div>
    </div>
  )
}
