'use client';

import { useState } from 'react';
import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';
import { useFaqs } from '@/hooks/useFaqs';

export function FaqTwo({ headline, plan }: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';
  const accentDark = organization?.colors?.['app-main-accent-dark'] ?? 'var(--org-primary-dark)';

  const { faq, backgroundImage } = useFaqs({ id: plan ?? undefined, headline });

  if (!faq || faq.length === 0) return null;

  return (
    <div
      className="pb-[100px] relative overflow-hidden bg-no-repeat bg-cover bg-center"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : {}}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="hidden md:block md:w-1/3" />
          <div className="w-full md:w-2/3">
            {headline && (
              <h2 className="uppercase text-left my-12 mb-4 font-bold text-3xl md:text-4xl text-black md:text-left text-center">
                {headline}
              </h2>
            )}
            <div className="space-y-3 mb-6">
              {faq.map((item, i) => (
                <div
                  key={i}
                  className="border border-[#ddd] rounded-sm shadow-none"
                  style={openIndex === i ? { borderTop: `4px solid ${accentDark}`, color: accentDark } : {}}
                >
                  <button
                    className="w-full flex justify-between items-center text-left px-4 py-3 text-[20px] font-medium text-black"
                    onClick={() => setOpenIndex(openIndex === i ? null : i)}
                    aria-expanded={openIndex === i}
                    aria-label={`Question: ${item.question}`}
                  >
                    <span style={openIndex === i ? { color: accentDark } : {}}>{item.question}</span>
                    <span
                      className="ml-2 transition-transform duration-200 flex-shrink-0"
                      style={{
                        transform: openIndex === i ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: openIndex === i ? accentDark : 'inherit',
                      }}
                    >
                      &#8964;
                    </span>
                  </button>
                  {openIndex === i && (
                    <div className="px-4 pb-4 text-[18px] text-black border-t border-[#eee]" style={{ fontFamily: 'Khand, sans-serif' }}>
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute left-0 right-[-60%] bottom-0 h-[100px] -mb-[50px] rotate-[-3deg]"
        style={{ background: accentColor }}
      />
      <div
        className="absolute left-0 right-[-60%] bottom-0 h-[100px] -mb-[85px] rotate-[-1deg]"
        style={{ background: accentDark }}
      />
    </div>
  );
}
