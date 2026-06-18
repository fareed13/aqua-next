'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';

export function ScheduleDefault({ headline }: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';

  return (
    <div
      className="relative w-full min-h-[400px] overflow-hidden flex items-center justify-center"
      style={{ background: accentColor }}
    >
      <div className="relative z-10 text-center py-16 px-4">
        <h2 className="uppercase text-3xl md:text-4xl font-bold text-white mb-6">
          {headline ?? 'Schedule'}
        </h2>
        <div className="bg-white rounded shadow-lg max-w-md mx-auto p-8">
          <div className="text-5xl mb-4 text-center">&#128197;</div>
          <p className="text-gray-700 text-lg font-medium text-center">Schedule</p>
          <p className="text-gray-500 text-sm mt-2 text-center">
            Class schedule will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
