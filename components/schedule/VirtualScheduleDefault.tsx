'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';

export function VirtualScheduleDefault({ headline }: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';

  return (
    <div className="relative w-full py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {headline && (
          <h2 className="text-center text-2xl md:text-3xl font-semibold mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {headline}
          </h2>
        )}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-[#e0e0e0]">
          <div
            className="p-4 text-white text-center font-bold text-lg"
            style={{ background: accentColor }}
          >
            Virtual Schedule
          </div>
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">&#128197;</div>
            <p className="text-gray-700 text-lg font-medium">Schedule</p>
            <p className="text-gray-500 text-sm mt-2">
              Virtual class schedule will appear here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
