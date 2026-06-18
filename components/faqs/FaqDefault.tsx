'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqDefaultProps extends SectionProps {
  faqs?: FaqItem[];
}

export function FaqDefault({ headline, faqs }: FaqDefaultProps) {
  const location = useOrgStore((s) => s.location);
  const faqList: FaqItem[] = faqs ?? (location as any)?.faqs ?? [];

  if (!faqList || faqList.length === 0) return null;

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {headline && (
          <h2 className="uppercase block text-center my-12 mb-10 font-bold text-black text-3xl md:text-4xl">
            {headline}
          </h2>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {faqList.map((item, i) => (
            <div key={i} className="pb-4 border-b border-dashed border-[#d5242c] h-full">
              <h3 className="flex items-center gap-2 text-[#d5242c] font-bold text-2xl" style={{ fontFamily: 'Khand, sans-serif' }}>
                <span className="text-3xl">&#10067;</span>
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
