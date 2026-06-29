'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useFaqs } from '@/hooks/useFaqs';

export function FaqDefault({ headline, plan }: SectionProps) {
  const { faq } = useFaqs({ id: plan ?? undefined, headline })

  if (!faq || faq.length === 0) return null;

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {headline && (
          <h2 className="uppercase block text-center my-12 mb-10 font-bold text-black text-3xl md:text-4xl" style={{ fontFamily: 'Khand, sans-serif' }}>
            {headline}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {faq.map((item, i) => (
            <div key={i} className="pb-4 border-b border-dashed border-[#d5242c] h-full">
              <h3 className="flex items-center gap-2 text-[#d5242c] font-bold text-2xl" style={{ fontFamily: 'Khand, sans-serif' }}>
                {/* Question comment icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="#d5242c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <line x1="9" y1="10" x2="15" y2="10" />
                  <line x1="12" y1="7" x2="12" y2="13" />
                </svg>
                {item.question}
              </h3>
              <p className="mt-2 text-lg font-bold" style={{ fontFamily: 'Khand, sans-serif' }}>
                {item.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
