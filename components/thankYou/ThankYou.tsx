'use client'

import Link from 'next/link'
import { useOrgStore } from '@/store/orgStore'

export function ThankYou() {
  const organization = useOrgStore(s => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#d5242c'
  const thanksText = organization?.thanks_page_text ?? ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] relative overflow-hidden flex items-center justify-center mt-[73px] max-[767px]:mt-[60px]">
      {/* Floating background shapes */}
      <div className="absolute inset-0 overflow-hidden z-[1]">
        {[
          'w-[100px] h-[100px] top-[15%] left-[10%] animate-[float_8s_ease-in-out_infinite]',
          'w-[150px] h-[150px] top-[60%] right-[15%] animate-[float_8s_ease-in-out_infinite_2s]',
          'w-[80px] h-[80px] bottom-[20%] left-[20%] animate-[float_8s_ease-in-out_infinite_4s] max-[767px]:hidden',
          'w-[120px] h-[120px] top-[30%] right-[30%] animate-[float_8s_ease-in-out_infinite_6s] max-[767px]:hidden',
        ].map((cls, i) => (
          <div
            key={i}
            className={`absolute rounded-full opacity-10 ${cls}`}
            style={{ background: accentColor }}
          />
        ))}
      </div>

      {/* Content card */}
      <div className="relative z-[2] bg-white rounded-[20px] py-[60px] px-[40px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] max-w-[600px] w-full mx-auto max-[767px]:py-[30px] max-[767px]:px-[15px] max-[767px]:mx-[10px] max-[767px]:rounded-[15px]">
        <div className="text-center">
          {thanksText ? (
            <div
              className="prose max-w-none [&_h1]:text-black [&_h2]:text-black [&_h3]:text-black [&_h4]:text-black [&_h5]:text-black [&_p]:text-black"
              dangerouslySetInnerHTML={{ __html: thanksText }}
            />
          ) : (
            <h1 className="text-4xl font-bold uppercase tracking-wider mb-5" style={{ fontFamily: 'Khand, sans-serif' }}>
              Thank You!
            </h1>
          )}

          <div className="mt-4 flex justify-center flex-wrap gap-[10px]">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white font-semibold uppercase tracking-wider px-[30px] py-[12px] rounded-lg no-underline"
              style={{ backgroundColor: accentColor, fontFamily: 'Khand, sans-serif' }}
            >
              Go Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
