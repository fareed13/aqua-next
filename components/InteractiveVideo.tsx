'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { SectionProps } from '@/components/sections/registry';
import type { Media } from '@/types/api';
import { buildMediaUrl } from '@/lib/utils/media';
import { useOrgStore } from '@/store/orgStore';
import { useUiStore } from '@/store/uiStore';
import { useInterestedServices } from '@/hooks/useInterestedServices';

interface InteractiveProgram {
  service: number;
  media: Media & { type?: string };
}

interface InteractiveVideoProps extends SectionProps {
  interactiveVideo?: InteractiveProgram[];
}

export function InteractiveVideo({ interactiveVideo }: InteractiveVideoProps) {
  const organization = useOrgStore((s) => s.organization);
  const setDialog = useUiStore((s) => s.setDialog);
  const { setInterestedService } = useInterestedServices();

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';
  const services = (organization as any)?.services ?? [];
  const isUk = (organization as any)?.is_uk ?? false;

  const [showForm, setShowForm] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const programs = interactiveVideo ?? [];

  const updateMediaFromFirst = useCallback(() => {
    if (programs.length > 0 && programs[0]) {
      const firstMedia = programs[0].media;
      if (firstMedia?.type === 'video') {
        setVideoSrc(buildMediaUrl(firstMedia));
        setImageSrc('');
      } else if (firstMedia?.type === 'image') {
        setImageSrc(buildMediaUrl(firstMedia));
        setVideoSrc('');
      } else {
        setVideoSrc('');
        setImageSrc('');
      }
    } else {
      setVideoSrc('');
      setImageSrc('');
    }
  }, [programs]);

  useEffect(() => {
    updateMediaFromFirst();
  }, [updateMediaFromFirst]);

  function getServiceName(id: number): string {
    const svc = services.find((s: any) => s.id === id);
    return svc ? svc.name : 'Program';
  }

  function handleProgramClick(program: InteractiveProgram) {
    setInterestedService(program.service);
    const m = program.media;
    if (m?.type === 'video') {
      setVideoSrc(buildMediaUrl(m));
      setImageSrc('');
    } else if (m?.type === 'image') {
      setImageSrc(buildMediaUrl(m));
      setVideoSrc('');
    }
    setOverlay(true);
    setShowForm(true);
    setTimeout(() => setOverlay(false), 2000);
  }

  function handleClose() {
    updateMediaFromFirst();
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDialog(true);
    setShowForm(false);
  }

  return (
    <div className="mt-8 mb-8 mx-4">
      {/* Loading overlay */}
      {overlay && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="relative flex items-center" style={{ gap: 0 }}>
        {/* Left column: video or image — col 8/12 */}
        <div
          className="overflow-hidden rounded-[20px]"
          style={{ width: '66.66%', height: 700, flexShrink: 0 }}
        >
          {videoSrc ? (
            <video
              ref={videoRef}
              src={videoSrc}
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full h-full object-cover rounded-[20px]"
            />
          ) : imageSrc ? (
            <div className="relative w-full h-full rounded-[20px] overflow-hidden">
              <Image
                src={imageSrc}
                alt="Interactive image"
                fill
                className="object-cover rounded-[20px]"
              />
            </div>
          ) : null}
        </div>

        {/* Right column: card — positioned absolutely on the right */}
        <div
          className="absolute flex items-center justify-center"
          style={{ right: -35, top: '50%', transform: 'translateY(-50%)' }}
        >
          {!showForm ? (
            <div
              className="bg-white rounded-[20px] shadow-lg text-center overflow-auto flex flex-col items-center justify-center"
              style={{ height: 600, maxHeight: 600, width: 500, maxWidth: 500 }}
            >
              <div className="flex justify-center mb-10">
                <h3
                  className="text-black font-medium"
                  style={{ width: '69%', lineHeight: '33px' }}
                >
                  What {isUk ? 'programme' : 'program'} are you interested in?
                </h3>
              </div>
              <div className="flex flex-col gap-5 w-full items-center">
                {programs.map((program, i) => (
                  <button
                    key={i}
                    onClick={() => handleProgramClick(program)}
                    className="text-white font-medium mb-5 hover:opacity-90 transition-opacity"
                    style={{ background: accentColor, width: '90%', padding: '10px 0', borderRadius: 4 }}
                    aria-label={`Select ${getServiceName(program.service)} ${isUk ? 'programme' : 'program'}`}
                  >
                    {getServiceName(program.service)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="bg-white rounded-[20px] shadow-lg overflow-auto mx-auto"
              style={{ height: 640, maxHeight: 640, maxWidth: 500, width: 500 }}
            >
              <div className="flex justify-end p-4" style={{ marginTop: '2%' }}>
                <button onClick={handleClose} className="text-gray-500 hover:text-black text-2xl leading-none" aria-label="Close form">
                  &#10005;
                </button>
              </div>
              <div className="px-6 pb-6">
                <div className="flex justify-center">
                  <h4 className="text-lg font-semibold mb-6" style={{ marginRight: '20%', width: '50%', lineHeight: '35px' }}>
                    Sign up for a trial today!
                  </h4>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3">
                  <div className="w-[75%]">
                    <input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div className="w-[75%]">
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div className="w-[75%]">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div className="w-[75%]">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                    />
                  </div>
                  <div className="w-[75%] pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 text-white font-semibold hover:opacity-90 transition-opacity mb-3 mt-5 rounded-[9px]"
                      style={{ background: accentColor }}
                      aria-label="Submit trial signup form"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
