'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';
import { useFaqs } from '@/hooks/useFaqs';

export function FaqTwo({ headline, id }: SectionProps) {
  const organization = useOrgStore((s) => s.organization);

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';
  const accentDark = organization?.colors?.['app-main-accent-dark'] ?? 'var(--org-primary-dark)';

  // Match Nuxt FaqTwo.vue exactly: it only declares `headline` and `id` props, so the
  // section's `service_id`/`plan` never reach useFaqs — only `id` (= section.id) does.
  // Passing `plan` here queried a different service and returned a different FAQ set.
  const { faq, backgroundImage } = useFaqs({ id: id ?? undefined, headline });

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
              <h2 className="uppercase text-left my-12 mb-4 font-semibold text-2xl md:text-3xl text-black md:text-left text-center">
                {headline}
              </h2>
            )}
            <div className="space-y-3 mb-6">
              {faq.map((item, i) => (
                <div
                  key={i}
                  className="border border-[#ddd] rounded-sm shadow-none px-4 py-3 text-black"
                  aria-label={`Question: ${item.question}`}
                >
                  <span className="text-[20px] font-medium">{item.question}</span>{' '}
                  <span className="text-[18px]" style={{ fontFamily: 'Khand, sans-serif' }}>
                    {item.answer}
                  </span>
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
