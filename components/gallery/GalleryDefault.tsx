'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { SectionProps } from '@/components/sections/registry';
import { buildMediaUrl } from '@/lib/utils/media';

export function GalleryDefault({ headline, media }: SectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [popImg, setPopImg] = useState<string | null>(null);
  const [dialog, setDialog] = useState(false);

  const gallery = (media ?? []).map((item) => buildMediaUrl(item));

  if (!gallery.length) {
    return (
      <div className="our-gallery pb-12 overflow-hidden bg-[#2b2b2b]">
        {headline && (
          <h2 className="uppercase block text-center my-12 font-bold text-white text-3xl md:text-4xl">
            {headline}
          </h2>
        )}
        <div className="flex justify-center items-center min-h-[120px]">
          <p className="text-white text-center text-sm opacity-60">No gallery images added yet</p>
        </div>
      </div>
    );
  }

  const visibleCount = 3;
  const startIndex = activeIndex;

  const prev = () => setActiveIndex((i) => Math.max(0, i - 1));
  const next = () => setActiveIndex((i) => Math.min(gallery.length - visibleCount, i + 1));

  return (
    <div className="our-gallery pb-12 overflow-hidden bg-[#2b2b2b]">
      {headline && (
        <h2 className="uppercase block text-center my-12 font-bold text-white text-3xl md:text-4xl">
          {headline}
        </h2>
      )}

      <div className="mx-5 md:mx-[120px] relative">
        <div className="flex items-center gap-2">
          <button
            onClick={prev}
            disabled={activeIndex === 0}
            aria-label="Previous gallery image"
            className="flex-shrink-0 w-[50px] h-[50px] bg-[#555] text-white rounded flex items-center justify-center hover:bg-[var(--org-primary)] disabled:opacity-30 transition-colors"
          >
            &#8249;
          </button>

          <div className="flex-1 overflow-hidden">
            <div
              className="flex gap-2 transition-transform duration-300"
              style={{ transform: `translateX(-${startIndex * (302 + 8)}px)` }}
            >
              {gallery.map((src, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 cursor-pointer overflow-hidden"
                  style={{ width: 302, height: 350 }}
                  onClick={() => { setPopImg(src); setDialog(true); }}
                >
                  <Image
                    src={src}
                    alt={`Gallery image ${i + 1}`}
                    width={302}
                    height={350}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={next}
            disabled={activeIndex >= gallery.length - visibleCount}
            aria-label="Next gallery image"
            className="flex-shrink-0 w-[50px] h-[50px] bg-[#555] text-white rounded flex items-center justify-center hover:bg-[var(--org-primary)] disabled:opacity-30 transition-colors"
          >
            &#8250;
          </button>
        </div>
      </div>

      {dialog && popImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={() => setDialog(false)}
        >
          <div
            className="relative max-w-[600px] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDialog(false)}
              aria-label="Close gallery image"
              className="absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/80"
            >
              &#10005;
            </button>
            <Image
              src={popImg}
              alt="Gallery image preview"
              width={600}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}
