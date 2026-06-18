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

  const visibleMedia = showAll ? media : media.slice(0, 9);

  return (
    <div className="mx-auto my-10 px-4">
      <div
        className="overflow-y-hidden px-5"
        style={{ maxHeight: showAll ? 'none' : 656 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {visibleMedia.map((m, i) => {
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
                  width={400}
                  height={300}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors z-10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <span style={{ color: accentColor, fontSize: 50 }}>&#128065;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-4">
        <button
          onClick={() => setShowAll((v) => !v)}
          className="px-6 py-2 font-semibold hover:opacity-80 transition-opacity"
          style={{ color: accentColor }}
          aria-label={showAll ? 'View fewer gallery images' : 'View more gallery images'}
        >
          {showAll ? 'View Less' : 'View More'}
        </button>
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative max-w-[600px] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedIndex(null)}
              aria-label="Close image"
              className="absolute top-1 right-1 z-10 bg-white rounded-full w-8 h-8 flex items-center justify-center border border-[#ccc] text-sm"
              style={{ color: accentColor }}
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
