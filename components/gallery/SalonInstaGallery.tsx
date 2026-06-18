'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { SectionProps } from '@/components/sections/registry';
import type { Media } from '@/types/api';
import { buildMediaUrl } from '@/lib/utils/media';
import { useOrgStore } from '@/store/orgStore';

export function SalonInstaGallery({ headline, media, customBullets }: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const [showAll, setShowAll] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const bullets = customBullets ?? [];
  const logoSrc = media && media.length > 0 ? buildMediaUrl(media[0]) : '';
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';

  const visibleBullets = showAll ? bullets : bullets.slice(0, 8);

  return (
    <div className="py-[60px] px-[10px]">
      <div className="mx-auto text-center table">
        {logoSrc && (
          <Image
            src={logoSrc}
            alt="Instagram logo"
            width={66}
            height={66}
            className="mx-auto"
            loading="lazy"
          />
        )}
        <div className="flex items-center justify-center gap-2 mt-2">
          <span style={{ color: accentColor, fontSize: 30 }}>&#126;</span>
          <h3 className="capitalize text-4xl font-normal mx-2">{headline}</h3>
          <span style={{ color: accentColor, fontSize: 30 }}>&#126;</span>
        </div>
        <p className="mt-2 text-[#555]">Follow Us on Instagram For More Images</p>
      </div>

      <div
        className="mt-10 overflow-y-hidden px-5"
        style={{ maxHeight: showAll ? 'none' : 341 }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px]">
          {visibleBullets.map((bullet, i) => {
            if (!bullet?.media || bullet.media.extension === 'mp4') return null;
            const imgSrc = buildMediaUrl(bullet.media);
            return (
              <div
                key={i}
                className="relative mb-[2px] group cursor-pointer"
                onClick={() => setSelectedIndex(i)}
              >
                <Image
                  src={imgSrc}
                  alt={`Instagram gallery image ${i + 1}`}
                  width={300}
                  height={300}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity"
                  style={{ backgroundColor: accentColor }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <span className="text-white text-4xl">&#128065;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {bullets.length > 4 && (
        <div className="text-center mt-4">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-white font-bold px-6 py-2 border border-white/30 hover:opacity-80 transition-opacity"
            style={{ color: accentColor, borderColor: accentColor }}
            aria-label={showAll ? 'View fewer Instagram gallery images' : 'View more Instagram gallery images'}
          >
            {showAll ? 'View Less' : 'View More'}
          </button>
        </div>
      )}

      {selectedIndex !== null && visibleBullets[selectedIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setSelectedIndex(null)}
        >
          <div className="relative max-w-[600px] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedIndex(null)}
              aria-label="Close image"
              className="absolute top-2 right-2 z-10 text-white text-2xl"
              style={{ backgroundColor: accentColor, padding: '4px 8px' }}
            >
              &#10005;
            </button>
            <Image
              src={buildMediaUrl(visibleBullets[selectedIndex]?.media)}
              alt={`Instagram gallery image ${selectedIndex + 1}`}
              width={600}
              height={600}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
