'use client'

import type { SectionProps } from '@/components/sections/registry'

export function ChangeProgram({ headline }: SectionProps) {
  // isUk detection not available client-side in Next; default to 'program'
  const word = 'program'
  const wordUc = 'PROGRAM'

  return (
    <div className="py-5 bg-white border-y-[15px] border-[#d5242c]">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="uppercase text-center block mb-4 font-bold text-[28px] md:text-[40px] leading-[1.1]">
          <span className="text-[#d5242c]">
            NOT THE {wordUc} YOU ARE LOOKING FOR?
          </span>
          <br />
          <span className="text-black">
            LET ME HELP YOU CHOOSE A {wordUc}
          </span>
          <span className="text-[#d5242c]"> | </span>
          <span className="text-[#7f7f7f] font-extrabold">{wordUc} SELECTOR</span>
        </h2>

        <div className="flex justify-center mt-4 mb-2">
          <a href="/classes">
            <button
              className="px-6 py-3 text-white font-bold text-[21px] md:text-[24px] rounded-none"
              style={{ backgroundColor: '#d5242c' }}
              aria-label={`Choose a ${word}`}
            >
              Choose My Program
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}
