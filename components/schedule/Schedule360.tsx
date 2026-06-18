'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';

export function Schedule360({ headline }: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';

  return (
    <div className="text-white relative w-full pb-[150px]">
      <div
        className="relative w-full"
        style={{
          background: `linear-gradient(to bottom, ${accentColor}cc, ${accentColor}cc)`,
          minHeight: 650,
        }}
      >
        <div className="relative z-10 pt-12 pb-12 px-4">
          <h2 className="uppercase text-center text-3xl md:text-4xl font-bold text-white mt-10 mb-4">
            {headline ?? 'Time Table'}
          </h2>
          <div className="max-w-[800px] mx-auto bg-white text-black rounded shadow">
            <div className="p-8 text-center">
              <div className="text-5xl mb-4">&#128197;</div>
              <p className="text-gray-700 text-lg font-medium">Schedule / Time Table</p>
              <p className="text-gray-500 text-sm mt-2">
                Class schedule will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
