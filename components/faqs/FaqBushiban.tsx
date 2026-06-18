'use client';

import { useState } from 'react';
import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqBushibanProps extends SectionProps {
  faqs?: FaqItem[];
}

export function FaqBushiban({ headline, faqs }: FaqBushibanProps) {
  const location = useOrgStore((s) => s.location);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqList: FaqItem[] = faqs ?? (location as any)?.faqs ?? [];

  if (!faqList || faqList.length === 0) return null;

  return (
    <div
      className="pb-[300px] md:pb-[400px] relative overflow-hidden text-black px-4"
      style={{
        backgroundImage: 'linear-gradient(62deg, #07e0fc 0%, #1d2d7a 100%)',
        transform: 'skewY(-6deg)',
        marginTop: '-100px',
        zIndex: 56,
      }}
    >
      <div style={{ transform: 'skewY(6deg)' }} className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3 flex justify-center">
            <div className="mt-[-20px] md:mt-0 text-center opacity-80">
              <div className="text-8xl">&#10067;</div>
            </div>
          </div>
          <div className="w-full md:w-2/3">
            {headline && (
              <h2
                className="uppercase text-left my-12 mb-4 font-bold text-3xl md:text-4xl text-white text-center md:text-left"
              >
                {headline}
              </h2>
            )}
            <div className="space-y-3 mb-6">
              {faqList.map((item, i) => (
                <div
                  key={i}
                  className="rounded-sm mb-3 text-black"
                  style={openIndex === i ? { borderTop: '4px solid #000' } : { border: '1px solid #ccc' }}
                >
                  <button
                    className="w-full flex justify-between items-center text-left px-4 py-3 text-[20px] font-medium text-black bg-white"
                    style={{ fontFamily: 'Khand, sans-serif' }}
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    aria-expanded={openIndex === i}
                  >
                    <span>{item.question}</span>
                    <span
                      className="ml-2 text-[#156a9e] transition-transform duration-200 flex-shrink-0"
                      style={{ transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    >
                      &#8964;
                    </span>
                  </button>
                  {openIndex === i && (
                    <div
                      className="px-4 pb-4 text-[18px] bg-white text-black"
                      style={{ fontFamily: 'Khand, sans-serif' }}
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
