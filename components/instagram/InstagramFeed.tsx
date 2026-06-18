'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';

export function InstagramFeed({ headline }: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';

  return (
    <div className="mt-16 mb-8 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-2xl md:text-3xl font-bold mb-6" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, Roboto, sans-serif' }}>
          {headline ?? 'Follow us on Instagram'}
        </h2>
        <div
          className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-16 px-8 text-center"
          style={{ borderColor: accentColor }}
        >
          <div className="text-6xl mb-4">&#9400;</div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: accentColor }}>
            Instagram Feed
          </h3>
          <p className="text-gray-500 text-sm max-w-md">
            Instagram posts will appear here once the feed is connected.
          </p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-6 py-2 text-white font-medium rounded hover:opacity-90 transition-opacity"
            style={{ background: accentColor }}
          >
            Follow Us on Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
