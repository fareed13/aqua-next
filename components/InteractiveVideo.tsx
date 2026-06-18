'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import type { SectionProps } from '@/components/sections/registry';
import type { Media } from '@/types/api';
import { buildMediaUrl } from '@/lib/utils/media';
import { useOrgStore } from '@/store/orgStore';
import { useUiStore } from '@/store/uiStore';

interface InteractiveProgram {
  service: number;
  media: Media & { type?: string };
}

interface InteractiveVideoProps extends SectionProps {
  interactiveVideo?: InteractiveProgram[];
}

export function InteractiveVideo({ headline, interactiveVideo }: InteractiveVideoProps) {
  const organization = useOrgStore((s) => s.organization);
  const setDialog = useUiStore((s) => s.setDialog);
  const [showForm, setShowForm] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';
  const services = (organization as any)?.services ?? [];

  const programs = interactiveVideo ?? [];

  useEffect(() => {
    if (programs.length > 0 && programs[0]) {
      const firstMedia = programs[0].media;
      if (firstMedia?.type === 'video') {
        setVideoSrc(buildMediaUrl(firstMedia));
        setImageSrc('');
      } else if (firstMedia?.type === 'image') {
        setImageSrc(buildMediaUrl(firstMedia));
        setVideoSrc('');
      }
    }
  }, []);

  function getServiceName(id: number): string {
    const svc = services.find((s: any) => s.id === id);
    return svc ? svc.name : 'Program';
  }

  function handleProgramClick(program: InteractiveProgram) {
    const m = program.media;
    if (m?.type === 'video') {
      setVideoSrc(buildMediaUrl(m));
      setImageSrc('');
    } else if (m?.type === 'image') {
      setImageSrc(buildMediaUrl(m));
      setVideoSrc('');
    }
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDialog(true);
    setShowForm(false);
  }

  return (
    <div className="my-8 mx-4 md:mx-8">
      <div className="relative flex flex-col md:flex-row items-center gap-4">
        <div className="w-full md:w-2/3 overflow-hidden rounded-[20px]" style={{ height: 700 }}>
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
            <Image
              src={imageSrc}
              alt="Interactive image"
              width={800}
              height={700}
              className="w-full h-full object-cover rounded-[20px]"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-[20px] flex items-center justify-center">
              <span className="text-gray-400 text-xl">No media</span>
            </div>
          )}
        </div>

        <div className="w-full md:w-auto md:absolute md:right-0 flex items-center justify-center">
          {!showForm ? (
            <div
              className="bg-white rounded-[20px] shadow-lg text-center p-6 overflow-auto"
              style={{ minWidth: 320, maxWidth: 500, maxHeight: 600 }}
            >
              <h3 className="mb-8 text-black text-lg font-semibold leading-tight w-[69%] mx-auto">
                What program are you interested in?
              </h3>
              <div className="flex flex-col gap-4">
                {programs.map((program, i) => (
                  <button
                    key={i}
                    onClick={() => handleProgramClick(program)}
                    className="w-[90%] mx-auto py-3 text-white font-medium rounded hover:opacity-90 transition-opacity"
                    style={{ background: accentColor }}
                    aria-label={`Select ${getServiceName(program.service)} program`}
                  >
                    {getServiceName(program.service)}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className="bg-white rounded-[20px] shadow-lg overflow-auto"
              style={{ minWidth: 320, maxWidth: 500, maxHeight: 640 }}
            >
              <div className="flex justify-end p-4">
                <button onClick={handleClose} className="text-gray-500 hover:text-black text-2xl leading-none">
                  &#10005;
                </button>
              </div>
              <div className="px-6 pb-6">
                <h4 className="text-center text-lg font-semibold mb-6">Sign up for a trial today!</h4>
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                  />
                  <button
                    type="submit"
                    className="mt-4 py-3 text-white font-semibold rounded hover:opacity-90 transition-opacity"
                    style={{ background: accentColor }}
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
