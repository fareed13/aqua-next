'use client'

import Image from 'next/image'
import { buildMediaUrl } from '@/lib/utils/media'
import type { SectionProps } from '@/components/sections/registry'

export function SalonAppointment({ headline, subtitle, backgroundImage, media }: SectionProps) {
  const imgUrl = media && media.length > 0 ? buildMediaUrl(media[0]) : ''
  const bgUrl = backgroundImage
    ? `${process.env.NEXT_PUBLIC_AMAZONAWS_IMAGE_URL}${backgroundImage}`
    : ''

  return (
    <div
      className="py-12 px-4"
      style={{
        backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
        backgroundSize: 'cover',
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row">
          {/* Left form */}
          <div className="md:w-1/2">
            <div className="mb-8">
              <strong
                className="mb-2 block text-xl"
                style={{ color: 'var(--org-primary)' }}
              >
                {headline}
              </strong>
              <div className="flex items-center gap-2.5">
                <h3 className="text-[29px] font-normal capitalize md:text-[40px]">{subtitle}</h3>
                <span style={{ color: 'var(--org-primary)', fontSize: 30 }}>&#8764;</span>
              </div>
              <p className="mt-2.5 text-[#555555]">Get relax any day and any time. Book Your Stay Today</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                type="text"
                placeholder="Your Name"
                className="h-[58px] border border-[#ccc] bg-white px-4 outline-none"
                aria-label="Your Name"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="h-[58px] border border-[#ccc] bg-white px-4 outline-none"
                aria-label="Your Email"
              />
              <input
                type="tel"
                placeholder="Phone No."
                className="h-[58px] border border-[#ccc] bg-white px-4 outline-none"
                aria-label="Phone No."
              />
              <input
                type="text"
                placeholder="Select Service"
                className="h-[58px] border border-[#ccc] bg-white px-4 outline-none"
                aria-label="Select Service"
              />
              <div className="md:col-span-2">
                <input
                  type="text"
                  placeholder="Address"
                  className="h-[58px] w-full border border-[#ccc] bg-white px-4 outline-none"
                  aria-label="Address"
                />
              </div>
              <div className="md:col-span-2">
                <textarea
                  placeholder="Your Message"
                  rows={4}
                  className="w-full border border-[#ccc] bg-white px-4 py-3 outline-none"
                  aria-label="Your Message"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  className="h-[50px] min-w-[160px] text-white"
                  style={{ backgroundColor: 'var(--org-primary)', borderRadius: 0 }}
                  aria-label="Send appointment request"
                >
                  Send Now
                </button>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="pl-0 md:w-1/2 md:pl-16">
            {imgUrl && (
              <Image
                src={imgUrl}
                alt={headline || 'Appointment section image'}
                width={600}
                height={430}
                className="mt-5 h-[430px] w-full object-cover"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
