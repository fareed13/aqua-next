'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { SectionProps } from '@/components/sections/registry';
import { buildMediaUrl } from '@/lib/utils/media';
import { useOrgStore } from '@/store/orgStore';

export function SalonGallery({ media }: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const [showAll, setShowAll] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';

  if (!media || media.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="my-10">
        {/* Gallery grid — height-clipped like Nuxt, expands on View More */}
        <div
          className="px-5 overflow-hidden"
          style={{
            maxHeight: showAll ? 'none' : 656,
            overflowY: showAll ? 'auto' : 'hidden',
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {media.map((m, i) => {
              const src = buildMediaUrl(m);
              return (
                <div
                  key={i}
                  className="relative cursor-pointer border border-[#ccc] p-[5px] overflow-hidden group"
                  style={{ height: 300 }}
                  onClick={() => setSelectedIndex(i)}
                  role="button"
                  aria-label={`View gallery image ${i + 1}`}
                >
                  <Image
                    src={src}
                    alt={`Gallery image ${i + 1}`}
                    fill
                    className="object-contain object-top"
                    loading="lazy"
                  />
                  {/* Hover dark overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/55 transition-colors z-10" />
                  {/* Eye icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* View More / View Less */}
        <div className="text-center" style={{ marginTop: -10 }}>
          <button
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1 font-semibold text-white px-4 py-2"
            style={{ color: accentColor }}
            aria-label={showAll ? 'View fewer gallery images' : 'View more gallery images'}
          >
            {showAll ? (
              <>
                View Less
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15" /></svg>
              </>
            ) : (
              <>
                View More
                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9" /></svg>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lightbox modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative max-w-[600px] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedIndex(null)}
              aria-label="Close image"
              className="absolute top-1 right-1 z-10 bg-white rounded-full flex items-center justify-center border border-[#ccc]"
              style={{ color: accentColor, width: 32, height: 32, padding: '6px', borderRadius: '47px' }}
            >
              &#10005;
            </button>
            <Image
              src={buildMediaUrl(media[selectedIndex])}
              alt={`Gallery image ${selectedIndex + 1}`}
              width={600}
              height={500}
              className="w-full h-auto object-cover block"
            />
          </div>
        </div>
      )}
    </div>
  );
}
