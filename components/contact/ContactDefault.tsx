'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';

const SOCIAL_ICONS: Record<string, string> = {
  linkedin: 'in',
  facebook: 'f',
  instagram: '&#9400;',
  twitter: 'X',
  youtube: '&#9654;',
  google: 'G',
  snapchat: '&#128155;',
  pinterest: 'P',
};

export function ContactDefault(_props: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const location = useOrgStore((s) => s.location);

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';
  const phone = location?.pretty_phone ?? '';
  const email = location?.email ?? '';
  const street = location?.street ?? '';
  const city = location?.city ?? '';
  const stateName = location?.state?.name ?? '';
  const zip = location?.zip_code ?? '';
  const orgName = organization?.name ?? '';
  const placeId = location?.google_place_id ?? '';
  const socialMedia: Array<{ platform: string; url: string }> = (location as any)?.social_media ?? [];
  const showEmail = organization?.is_email_show_enabled;

  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ''
  const mapSrc = placeId && mapsKey
    ? `https://www.google.com/maps/embed/v1/place?q=place_id:${placeId}&key=${mapsKey}`
    : '';

  return (
    <div className="contactUs-main">
      <div className="relative max-w-[460px] mx-auto mt-[100px] mb-[100px] z-[9] px-4 md:px-0">
        <div
          className="absolute w-[95%] h-[90%] right-[-5px] top-[-5px]"
          style={{ background: accentColor }}
        />
        <div className="relative bg-white shadow-lg p-[30px_10px] min-h-[272px]">
          <div className="px-5">
            {phone && (
              <div className="flex items-start mb-5">
                <span className="mr-8 text-2xl flex-shrink-0">&#9990;</span>
                <a
                  href={`tel:${phone}`}
                  className="no-underline text-black hover:underline"
                  aria-label={`Call us at ${phone}`}
                >
                  <p className="mb-0">{phone}</p>
                </a>
              </div>
            )}
            {showEmail && email && (
              <div className="flex items-start mb-5">
                <span className="mr-8 text-xl flex-shrink-0">&#9993;</span>
                <p className="mb-0">{email}</p>
              </div>
            )}
            <div className="flex items-start mb-5">
              <span className="mr-8 text-2xl flex-shrink-0">&#128205;</span>
              <p className="mb-0">
                <span className="block">{orgName}</span>
                <span className="ml-10 block">{street}</span>
                <span className="ml-10 block">
                  {city}, {stateName} {zip}
                </span>
              </p>
            </div>
          </div>

          {socialMedia.length > 0 && (
            <div className="absolute bottom-[10px] left-[74px] right-[20px] flex gap-4 mt-6 flex-wrap">
              {socialMedia.map((sm, i) => (
                <a
                  key={i}
                  href={sm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${sm.platform} page`}
                  className="text-xl font-bold hover:opacity-70 transition-opacity"
                  style={{ color: accentColor }}
                >
                  <span dangerouslySetInnerHTML={{ __html: SOCIAL_ICONS[sm.platform?.toLowerCase()] ?? '&#8599;' }} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {mapSrc && (
        <div className="mt-[100px]">
          <iframe
            src={mapSrc}
            width="100%"
            height="550"
            style={{ border: 0 }}
            allowFullScreen
            title={`Map showing ${city} location`}
            aria-label={`Map showing ${city} location`}
            tabIndex={0}
          />
        </div>
      )}
    </div>
  );
}
