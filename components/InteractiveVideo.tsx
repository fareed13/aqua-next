'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import type { SectionProps } from '@/components/sections/registry';
import type { Media } from '@/types/api';
import { buildMediaUrl } from '@/lib/utils/media';
import { useOrgStore } from '@/store/orgStore';
import { useInterestedServices } from '@/hooks/useInterestedServices';
import { useNonSecureCalls, NON_SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls';
import { getPublicAuthHeader } from '@/lib/utils/initializeSocket';

interface InteractiveProgram {
  service: number;
  media: Media & { type?: string };
}

interface InteractiveVideoProps extends SectionProps {
  interactiveVideo?: InteractiveProgram[];
}

export function InteractiveVideo({ interactiveVideo }: InteractiveVideoProps) {
  const organization = useOrgStore((s) => s.organization);
  const allLocations = useOrgStore((s) => s.locations);
  const primaryLocation = useOrgStore((s) => s.location);
  const { setInterestedService } = useInterestedServices();
  const { postPublicProtected } = useNonSecureCalls();

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#1976D2';
  const services = (organization as any)?.services ?? [];

  const isUk = useMemo(() => {
    const st = (primaryLocation as any)?.state
    if (!st?.name) return false
    const name = st.name.toLowerCase()
    return name === 'united kingdom' || st.parent_state?.name?.toLowerCase() === 'united kingdom'
  }, [primaryLocation])

  const isAustralia = useMemo(() => {
    const st = (primaryLocation as any)?.state
    if (!st?.name) return false
    const name = st.name.toLowerCase()
    return name === 'australia' || st.parent_state?.name?.toLowerCase() === 'australia'
  }, [primaryLocation])

  const isNewZealand = useMemo(() => {
    const st = (primaryLocation as any)?.state
    if (!st?.name) return false
    const name = st.name.toLowerCase()
    return name === 'new zealand' || st.parent_state?.name?.toLowerCase() === 'new zealand'
  }, [primaryLocation])

  const [showForm, setShowForm] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const [videoSrc, setVideoSrc] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customField, setCustomField] = useState('');
  const [reasonForJoining, setReasonForJoining] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(
    allLocations.length === 1 ? allLocations[0] : null
  );

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

  // Auto-select single location
  useEffect(() => {
    if (allLocations.length === 1) setSelectedLocation(allLocations[0]);
  }, [allLocations]);

  function getServiceName(id: number): string {
    const svc = services.find((s: any) => s.id === id);
    return svc ? svc.name : 'Program';
  }

  function handleProgramClick(program: InteractiveProgram) {
    setInterestedService(program.service);
    setSelectedServiceId(program.service);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return;

    setLoading(true);
    try {
      const org = organization!;
      const authHeader = await getPublicAuthHeader(org.id, false);
      await postPublicProtected(
        NON_SECURE_ENDPOINTS.CUSTOMER_CREATE,
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          location_id: selectedLocation?.id ?? allLocations[0]?.id,
          service: selectedServiceId,
          tags: ['general'],
          is_uk: isUk,
          sms_opt_in: smsOptIn,
          custom_field: customField || undefined,
          reason_for_joining: reasonForJoining || undefined,
        },
        authHeader,
      );
      toast.success('Lead submitted successfully');
      setShowForm(false);
      setFirstName(''); setLastName(''); setEmail(''); setPhone('');
      setCustomField(''); setReasonForJoining(''); setSmsOptIn(false);
    } catch (err) {
      console.error(err);
      toast.error('Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 mb-8 px-4 max-w-[1280px] mx-auto">
      {/* Loading overlay */}
      {overlay && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-black/40">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/*
        Row: position relative so the absolutely-positioned right card anchors here.
        Mobile: left col is full-width, card hangs at top-[500px] right-[10px]
                so we add bottom margin to prevent content overlap.
        Desktop (md+): left col is 2/3 width, card is right-[-35px] vertically centered.
      */}
      <div className="relative flex flex-wrap items-center mt-[20%] md:mt-2 mb-[250px] md:mb-0">

        {/* Left column: video or image */}
        <div
          className="w-full md:w-2/3 overflow-hidden rounded-[20px] flex-shrink-0 h-[550px] md:h-[700px]"
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

        {/*
          Right column card — absolutely positioned, overlapping the right edge on desktop.
          Mobile: top-[500px] right-[10px] (overlaps bottom of video).
          Desktop (md+): top-1/2 right-[-35px] translate-y-[-50%] (vertically centered).
        */}
        <div className="absolute top-[500px] right-[10px] md:top-1/2 md:right-[-35px] md:-translate-y-1/2 flex items-center justify-center">

          {/* Program selection card */}
          {!showForm && (
            <div
              className="bg-white rounded-[20px] shadow-lg text-center overflow-auto flex flex-col items-center justify-center
                         h-[355px] w-[342px] md:h-[600px] md:w-[500px]"
            >
              <div className="flex justify-center mb-10 px-4">
                <h3
                  className="text-black font-medium text-base md:text-lg"
                  style={{ width: '69%', lineHeight: '33px' }}
                >
                  What {isUk ? 'programme' : 'program'} are you interested in?
                </h3>
              </div>
              <div className="flex flex-col gap-5 w-full items-center px-2">
                {programs.map((program, i) => (
                  <button
                    key={i}
                    onClick={() => handleProgramClick(program)}
                    className="text-white font-medium hover:opacity-90 transition-opacity rounded w-[90%] py-2 md:py-[10px]"
                    style={{ background: accentColor }}
                    aria-label={`Select ${getServiceName(program.service)} ${isUk ? 'programme' : 'program'}`}
                  >
                    {getServiceName(program.service)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sign-up form card */}
          {showForm && (
            <div
              className="bg-white rounded-[20px] shadow-lg overflow-auto
                         max-w-[342px] md:max-w-[500px] w-[342px] md:w-[500px] h-[640px]"
            >
              <div className="flex justify-end p-4" style={{ marginTop: '2%' }}>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-black text-2xl leading-none"
                  aria-label="Close form"
                >
                  &#10005;
                </button>
              </div>

              <div className="px-4 md:px-6 pb-6">
                <div className="flex justify-center mb-2">
                  <h4
                    className="text-base md:text-lg font-semibold text-center"
                    style={{ lineHeight: '35px' }}
                  >
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
                      className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  <div className="w-[75%]">
                    <input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  <div className="w-[75%]">
                    {isAustralia || isNewZealand ? (
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        inputMode="numeric"
                        autoComplete="tel-national"
                        className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-500"
                      />
                    ) : isUk ? (
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        inputMode="numeric"
                        autoComplete="tel-national"
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-500"
                      />
                    ) : (
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        inputMode="numeric"
                        autoComplete="tel-national"
                        className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-500"
                      />
                    )}
                  </div>

                  <div className="w-[75%]">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-500"
                    />
                  </div>

                  {organization?.show_custom_field && (
                    <div className="w-[75%]">
                      <input
                        type="text"
                        placeholder={(organization as any).customer_custom_field || 'Custom Field'}
                        value={customField}
                        onChange={(e) => setCustomField(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-500"
                      />
                    </div>
                  )}

                  {organization?.show_reason_for_joining && (
                    <div className="w-[75%]">
                      <input
                        type="text"
                        placeholder="Reason for Joining"
                        value={reasonForJoining}
                        onChange={(e) => setReasonForJoining(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-500"
                      />
                    </div>
                  )}

                  {allLocations.length > 1 && (
                    <div className="w-[75%]">
                      <select
                        value={selectedLocation?.id ?? ''}
                        onChange={(e) => {
                          const loc = allLocations.find((l: any) => l.id === Number(e.target.value))
                          setSelectedLocation(loc ?? null)
                        }}
                        className="border border-gray-300 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-gray-500"
                      >
                        <option value="" disabled>Select a Location</option>
                        {allLocations.map((loc: any) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.target_locations?.[0] || loc.city}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {!isUk && organization?.consent_checkbox_enabled && (
                    <div className="w-[75%] flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={smsOptIn}
                        onChange={(e) => setSmsOptIn(e.target.checked)}
                        className="mt-1 shrink-0"
                      />
                      <span
                        className="text-xs text-gray-700"
                        dangerouslySetInnerHTML={{ __html: organization.consent_disclosure_text || '' }}
                      />
                    </div>
                  )}

                  <div className="w-[75%] pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 text-white font-semibold hover:opacity-90 transition-opacity mb-3 mt-5 rounded-[9px] disabled:opacity-60"
                      style={{ background: accentColor }}
                      aria-label="Submit trial signup form"
                    >
                      {loading ? 'Submitting…' : 'Submit'}
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
