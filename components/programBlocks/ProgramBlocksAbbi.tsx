'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'

export function ProgramBlocksAbbi({ headline = "LET'S FIND THE RIGHT PROGRAM FOR YOU" }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const services = organization?.services ?? []

  const [hoveredId, setHoveredId] = useState<number | null>(null)

  return (
    <div className="relative py-16 mb-24 overflow-hidden z-[6]">
      {/* Decorative wavy SVG background */}
      <svg
        className="absolute left-0 top-0 w-full max-w-full pointer-events-none"
        viewBox="0 0 1900 1101"
        aria-hidden="true"
        style={{ zIndex: -1 }}
      >
        <path
          fillOpacity="0.5"
          fillRule="evenodd"
          opacity="0.1"
          fill="#1867dd"
          d="M-8,1914.65s80.445-51.68,151.682-41.11c79.985,11.86,157.229,86.1,269.137,86.1,131.815,0,351.054-96.65,490.883-96.65,159.6,0,201.977,118.31,338.327,118.31,117.64,0,311.23-114.98,386.65-114.98,85.16,0,273.32,48.33,273.32,48.33V2930.67s-213.96-53.32-294.8-53.32c-71.14,0-144.42,86.65-255.98,86.65-138.6,0-296.79-99.99-461.838-99.99-142.031,0-266.792,66.66-400.975,66.66-94.741,0-220.587-56.66-320.981-56.66C66.973,2874.01-8,2930.67-8,2930.67V1914.65Z"
          transform="translate(0 -1863)"
        />
      </svg>

      {/* Heading */}
      {headline && (
        <h2
          className="text-center relative mt-[120px] mb-10 text-lg md:text-4xl lg:text-[50px] font-bold px-2"
          style={{ fontFamily: 'Khand, sans-serif', lineHeight: 1.108 }}
        >
          {headline}
        </h2>
      )}

      {/* Grid */}
      <div className="flex flex-wrap">
        {services.map((service, ig) => {
          const imgUrl = service.large_media
            ? buildMediaUrl(service.large_media)
            : service.small_media
            ? buildMediaUrl(service.small_media)
            : null
          const slug = service.slug || service.id
          const isHovering = hoveredId === service.id

          return (
            <div
              key={service.id}
              className="w-full sm:w-1/2 md:w-1/3 px-0.5 mb-8"
            >
              <div
                className="relative mx-auto cursor-pointer"
                style={{ maxWidth: 600 }}
                onMouseEnter={() => setHoveredId(service.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* SVG blob frame */}
                <div className="relative w-full" style={{ minHeight: '350px' }}>
                  <svg
                    className="w-full block mx-auto"
                    viewBox="0 0 760 802"
                    aria-hidden="true"
                  >
                    <defs>
                      <clipPath id={`clip-path-${ig}`}>
                        <path d="M203.672,721.847s128.347,25.724,363.288-14.891c0,0,89.407-18.927,120.515-150.334,0,0,39.99-184.553-4.063-335.49,0,0-7.463-51.567-83.339-107.185S313.161,2.986,215.835,57.605C116.8,113.187,87.31,187.633,78.122,212.085c0,0-74.264,160.921-34.868,325.222S143.881,702.97,203.672,721.847Z" />
                      </clipPath>
                    </defs>

                    {/* Background blob shape */}
                    <path
                      fill="#eaecf1"
                      d="M378,765s124.616-40.066,310-190c0,0,68.856-60.088,32-190,0,0-54.991-180.651-167-291,0,0-31.641-41.4-125-53S123.382,83.884,65,179C5.59,275.791,16.11,355.17,20,381c0,0,13.547,176.712,128,301S316.588,777.645,378,765Z"
                    />

                    {/* Clipped image inside blob */}
                    <foreignObject
                      x="0"
                      y="0"
                      width="100%"
                      height="100%"
                      clipPath={`url(#clip-path-${ig})`}
                    >
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={service.name || 'Program block image'}
                          className="w-full h-full"
                          style={{ objectFit: 'contain' }}
                          loading="lazy"
                        />
                      ) : (
                        <rect width="100%" height="100%" fill="#ccc" />
                      )}
                    </foreignObject>

                    {/* Hover overlay inside blob */}
                    {isHovering && (
                      <path
                        fill="rgba(87,92,236,0.8)"
                        d="M203.672,721.847s128.347,25.724,363.288-14.891c0,0,89.407-18.927,120.515-150.334,0,0,39.99-184.553-4.063-335.49,0,0-7.463-51.567-83.339-107.185S313.161,2.986,215.835,57.605C116.8,113.187,87.31,187.633,78.122,212.085c0,0-74.264,160.921-34.868,325.222S143.881,702.97,203.672,721.847Z"
                      />
                    )}
                  </svg>

                  {/* Hover content (name + link) */}
                  {isHovering && (
                    <div
                      className="absolute inset-0 flex items-center justify-center z-10"
                    >
                      <div className="text-center text-white max-w-[280px] md:max-w-[350px] px-4">
                        <Link
                          href={`/classes/${slug}/`}
                          className="no-underline text-white hover:underline"
                        >
                          <h5
                            className="uppercase text-lg md:text-2xl font-bold"
                            style={{ fontFamily: 'Khand, sans-serif' }}
                          >
                            {service.name}
                          </h5>
                        </Link>
                        {service.short_description && (
                          <p className="text-sm leading-[1.667] mt-1 line-clamp-2">
                            {service.short_description}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* View All button */}
        <div className="w-full text-center mt-0">
          <Link
            href="/classes"
            className="inline-block mx-auto text-white text-lg md:text-2xl font-bold capitalize px-6 py-2.5"
            style={{
              fontFamily: 'Khand, sans-serif',
              borderRadius: '40px',
              width: '280px',
              background: '#7656f4',
              textAlign: 'center',
            }}
          >
            View All
          </Link>
        </div>
      </div>
    </div>
  )
}
