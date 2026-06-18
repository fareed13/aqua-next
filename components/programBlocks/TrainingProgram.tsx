'use client'

import Link from 'next/link'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'

interface CustomBullet {
  headline?: string
  content?: string
}

interface TrainingProgramProps extends SectionProps {
  customBullets?: CustomBullet[]
}

export function TrainingProgram({
  headline = '',
  content = '',
  customBullets = [],
}: TrainingProgramProps) {
  const organization = useOrgStore(s => s.organization)

  return (
    <div className="bg-[#EEEEEE] py-10 px-6 md:py-[70px] md:px-[70px]">
      {/* Title box */}
      <div className="mb-8">
        {headline && (
          <h3 className="text-center font-extrabold uppercase text-[#111111] text-3xl md:text-[45px] leading-tight md:leading-[64px] tracking-[1px] max-w-[800px] mx-auto mb-5">
            {headline}
          </h3>
        )}
        {content && (
          <div
            className="text-center text-base text-[#777777] leading-[31px] max-w-[700px] mx-auto"
            dangerouslySetInnerHTML={{ __html: content ?? '' }}
          />
        )}
      </div>

      {/* Program cards */}
      {customBullets && customBullets.length > 0 && (
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap -mx-3">
            {customBullets.map((bullet, i) => (
              <div key={i} className="w-full sm:w-1/2 md:w-1/3 px-3 mb-6">
                <div
                  className="relative text-center p-[60px_30px] transition-all duration-500"
                  style={{
                    backgroundColor:
                      i % 2 === 1 && organization?.colors?.['app-main-accent-color']
                        ? organization.colors['app-main-accent-color']
                        : '#1A1A1A',
                    borderRadius: 0,
                  }}
                >
                  {/* Number */}
                  <div className="absolute top-2.5 right-5">
                    <strong
                      className="text-[40px] font-black uppercase tracking-[3px]"
                      style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'Khand, sans-serif' }}
                    >
                      {i < 9 ? `0${i + 1}` : i}
                    </strong>
                  </div>

                  {/* Check icon */}
                  <div className="mb-5 flex justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>

                  {bullet.headline && (
                    <h3 className="text-center uppercase text-white text-2xl font-extrabold leading-[30px] mb-2">
                      {bullet.headline}
                    </h3>
                  )}
                  {bullet.content && (
                    <p className="text-white mt-2.5 leading-7 overflow-hidden text-ellipsis line-clamp-2">
                      {bullet.content}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div className="mt-[60px] text-center">
            <Link
              href="/classes"
              className="inline-block relative h-[60px] px-10 pl-[85px] leading-[60px] text-white font-medium"
              style={{ backgroundColor: organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)', borderRadius: 0 }}
              aria-label="Choose a program"
            >
              <span
                className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-px bg-white"
                aria-hidden="true"
              />
              Choose a program
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
