'use client'

import { useUiStore } from '@/store/uiStore'
import type { SectionProps } from '@/components/sections/registry'

export function LetsGetStarted({ headline, content, bullets }: SectionProps) {
  const setDialog = useUiStore(s => s.setDialog)
  const bulletList = Array.isArray(bullets) ? bullets : bullets ? [bullets] : []

  return (
    <div className="bg-black py-10 px-4">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-2xl font-bold uppercase text-[#d5242c] md:text-[50px]">
          {headline}
        </h2>
        <div className="rounded-[10px] bg-[#333333] px-6 py-6">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            {/* Content & bullets */}
            <div className="flex-1 text-center md:text-left">
              {content && (
                <h3
                  className="text-xl leading-tight text-white md:text-2xl"
                  dangerouslySetInnerHTML={{ __html: content ?? '' }}
                />
              )}
              {bulletList.map((bullet: any, i: number) => (
                <ul key={i} className="mt-2 list-disc pl-5 text-white">
                  <li>{bullet}</li>
                </ul>
              ))}
            </div>

            {/* Price placeholder */}
            <div className="flex-1 text-center">
              <p className="mb-0 text-sm leading-tight text-white">STARTING AT</p>
              <p className="text-6xl leading-tight text-white">—</p>
            </div>

            {/* CTA */}
            <div className="flex-1 text-center">
              <button
                onClick={() => setDialog(true)}
                className="mx-auto block rounded-[10px] border-2 border-[#333333] bg-[#ffcc00] px-4 py-1.5 text-[30px] font-semibold text-black transition hover:bg-[#d5242c] hover:text-white hover:border-white md:text-[36px]"
                aria-label="Order now"
              >
                Order Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
