'use client';

import { useState } from 'react';
import type { SectionProps } from '@/components/sections/registry';

export function EmbedIframe({ headline, url }: SectionProps) {
  const [loaded, setLoaded] = useState(false);

  if (!url) return null;

  return (
    <div className="px-0 relative mt-[100px] scroll-mt-[100px]">
      {headline && (
        <h2 className="text-center text-2xl font-bold mb-4">{headline}</h2>
      )}
      <div className="relative" style={{ height: '100vh' }}>
        {!loaded && (
          <div className="absolute inset-0 z-[99] flex items-center justify-center bg-white/80">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[var(--org-primary)]" />
          </div>
        )}
        <iframe
          src={url}
          title={headline ?? 'Embedded content'}
          style={{ border: 0, width: '100%', height: '100vh', display: 'block' }}
          aria-hidden={false}
          tabIndex={0}
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
