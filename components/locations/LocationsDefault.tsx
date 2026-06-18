'use client';

import type { SectionProps } from '@/components/sections/registry';
import { useOrgStore } from '@/store/orgStore';

interface LocationState {
  name: string;
}

interface LocationItem {
  id: number;
  city: string;
  street?: string;
  state?: LocationState;
  zip_code?: string;
  pretty_phone?: string;
  domain?: string;
  slug?: string;
}

export function LocationsDefault(_props: SectionProps) {
  const organization = useOrgStore((s) => s.organization);
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? 'var(--org-primary)';
  const locations: LocationItem[] = (organization as any)?.locations ?? [];
  const orgName = organization?.name ?? '';

  return (
    <div
      className="py-12 px-4 bg-cover bg-top"
      style={{ backgroundSize: 'cover', backgroundPosition: 'top' }}
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-center text-3xl font-bold mb-8" style={{ fontFamily: 'Khand, sans-serif' }}>
          {orgName} locations!
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-center">
          {locations.map((location, i) => (
            <a
              key={i}
              href={location.domain ? `https://${location.domain}` : '#'}
              aria-label={`Visit ${location.city} location website`}
              className="no-underline group"
            >
              <div
                className="max-w-[300px] mx-auto text-center rounded-[80px_0_80px_0] overflow-hidden shadow-lg bg-white transition-colors duration-300 group-hover:text-white py-6 px-4"
                style={{ '--hover-bg': accentColor } as React.CSSProperties}
              >
                <div
                  className="mx-auto mb-2 w-[50px] h-[50px] rounded-full flex items-center justify-center text-2xl"
                  style={{ background: accentColor, color: 'white' }}
                >
                  &#128205;
                </div>
                <h3
                  className="uppercase font-bold text-[26px] mb-2"
                  style={{ color: accentColor, fontFamily: 'Khand, sans-serif' }}
                >
                  {location.city?.toUpperCase()}
                </h3>
                <span className="block text-[20px] leading-snug mb-4">
                  {location.street}
                  <br />
                  {location.city}, {location.state?.name} {location.zip_code}
                </span>
                {location.pretty_phone && (
                  <span className="block text-[20px]">
                    <span className="mr-2" style={{ color: accentColor }}>&#9990;</span>
                    {location.pretty_phone}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
