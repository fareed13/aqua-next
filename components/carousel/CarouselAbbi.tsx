'use client'

import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useUiStore } from '@/store/uiStore'

export function CarouselAbbi({ backgroundImage, url }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)

  return (
    <div className="relative min-h-[800px] md:min-h-[800px] pt-[100px] mb-[7%]">
      {/* SVG gradient background shape */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          x="0px"
          y="0px"
          viewBox="0 0 750 500"
          className="absolute top-0 right-0 w-2/3 h-auto"
          style={{ enableBackground: 'new 0 0 750 500' } as React.CSSProperties}
          xmlSpace="preserve"
        >
          <defs>
            <linearGradient
              id="banner_shape"
              gradientUnits="userSpaceOnUse"
              x1="348.0684"
              y1="182.4621"
              x2="750"
              y2="182.4621"
            >
              <stop offset="0" stopColor="#9d4fd5" />
              <stop offset="1" stopColor="#475fe8" />
            </linearGradient>
          </defs>
          <path
            fill="url(#banner_shape)"
            d="M750,0v364.9c-27.9-6.1-54.5-22.7-67.5-48.1c-8.2-16-11.6-35.8-25.9-46.7c-12-9.1-28.9-9.2-43.4-5
            c-14.5,4.2-27.6,12.1-41.5,18.1c-21.7,9.3-46.1,13.7-69,8.1c-22.9-5.6-43.7-22.6-49.9-45.3c-6.7-24.6,3-54.6-13.7-73.9
            c-18.7-21.6-56.8-13.1-77.5-32.8c-13.2-12.6-15.2-33.1-12.5-51.1c2.7-18,9.3-35.5,9.9-53.8c0.4-12-2.6-24.9-9.5-34.4H750z"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-8">
          {/* Left column */}
          <div className="w-full md:w-5/12 text-center md:text-left mt-10 md:mt-[100px]">
            <h3 className="text-2xl md:text-[30px] font-light mt-[40px] lg:mt-[100px]">
              MEET ABBI,
            </h3>
            <h2 className="text-lg md:text-[50px] font-extrabold leading-[1.108]">
              The world&apos;s best salesman for fitness centers
            </h2>
            <button
              onClick={() => setDialog(true)}
              className="mt-5 text-white bg-[#3e60e6] rounded-full px-8 py-4 text-lg font-semibold hover:bg-[#2d4fd0] transition"
              aria-label="Contact us"
            >
              Contact Us
            </button>
          </div>

          {/* Right column - laptop image */}
          <div className="w-full md:w-7/12 mt-[50px] md:mt-0 relative z-10">
            <Image
              src="https://abbi-public-images.s3.us-east-2.amazonaws.com/lapy-with-mobile-screen.png"
              alt="Abbi platform demonstration"
              width={700}
              height={450}
              className="w-full h-auto max-h-[450px] object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
