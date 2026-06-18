'use client';

import { useRef, useEffect } from 'react';
import { buildMediaUrl } from '@/lib/utils/media';
import { useOrgStore } from '@/store/orgStore';
import type { SectionProps } from '@/components/sections/registry'

export function VideoPlayer({ media: mediaArr, headline: ariaLabel }: SectionProps) {
  const media = Array.isArray(mediaArr) ? mediaArr[0] : mediaArr
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const organization = useOrgStore((s) => s.organization);

  const autoplay = true
  const isVideoSoundEnabled = (organization as any)?.is_video_sound_enabled ?? false;

  const videoSrc = media ? buildMediaUrl(media) : '';

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || !isVideoSoundEnabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (video) {
            video.muted = !entry.isIntersecting;
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isVideoSoundEnabled]);

  if (!videoSrc) return null;

  return (
    <div ref={containerRef} className="w-full">
      <video
        ref={videoRef}
        src={videoSrc}
        loop
        muted
        playsInline
        autoPlay={autoplay}
        controls
        aria-label={ariaLabel ?? 'Video player'}
        className="w-full h-auto block"
      />
    </div>
  );
}
