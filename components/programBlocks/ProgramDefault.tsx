'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { SectionProps } from '@/components/sections/registry'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { buildMediaUrl } from '@/lib/utils/media'
import { useInterestedServices } from '@/hooks/useInterestedServices'

const SHORT_DAYS: Record<string, string> = {
  Sunday: 'Sun',
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thur',
  Friday: 'Fri',
  Saturday: 'Sat',
}

// Vuetify v-card elevation-2 shadow
const CARD_SHADOW = '0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)'

// Vuetify v-chip (default) — matches Nuxt chip-group chip styling
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0,0,0,0.12)',
        padding: '0 12px',
        fontSize: 11,
        color: 'rgba(0,0,0,0.87)',
        margin: '2px 4px 2px 0',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

export function ProgramDefault({ headline = "LET'S FIND THE RIGHT PROGRAM FOR YOU" }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const locations = useOrgStore(s => s.locations)
  const setDialog = useUiStore(s => s.setDialog)
  const setSelectedPlan = useUiStore(s => s.setSelectedPlan)
  const { setInterestedService } = useInterestedServices()

  const location = useOrgStore(s => s.location)
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#d5242c'
  const industryType = (organization as any)?.industry_type ?? ''
  const isSalon = industryType === 'salon'
  const isFitnessCenter = industryType === 'fitness_center'
  const isSingleLocation = locations.length === 1
  const services = organization?.services ?? []

  const allSchedules: any[] = Object.values(location?.day_schedules ?? {}).flat()

  function handleSignup(service: any) {
    setSelectedPlan(null)
    setDialog(true)
    setInterestedService(service.id)
  }

  return (
    <div className="py-20" style={{ background: 'var(--org-app-main-background, #ffffff)' }}>
      <div className="max-w-7xl mx-auto px-0 overflow-hidden">
        {headline && (
          <h2 className="d-block text-center my-10 text-[28px] font-bold uppercase">
            {headline}
          </h2>
        )}

        <div className="flex flex-wrap">
          {services.map((service: any) => {
            const imgUrl = service.large_media
              ? buildMediaUrl(service.large_media)
              : service.small_media
              ? buildMediaUrl(service.small_media)
              : null
            const slug = service.slug || service.id
            const svcSchedules = isSingleLocation && !isSalon
              ? allSchedules.filter((sc: any) => sc.service?.id === service.id).slice(0, 3)
              : []

            return (
              <div key={service.id} className="w-full sm:w-1/2 md:w-1/3 mb-8">
                <div
                  className="mx-4 h-full flex flex-col bg-white rounded overflow-hidden"
                  style={{ boxShadow: CARD_SHADOW }}
                >
                  {/* Image area: 200px — matches Nuxt .program-card-media */}
                  <div className="relative w-full overflow-hidden rounded-t" style={{ height: 200 }}>
                    {imgUrl && (
                      <Image
                        src={imgUrl}
                        alt={service.name || 'Program image'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 640px"
                        loading="lazy"
                      />
                    )}
                    {/* Title overlay at bottom — no gradient (matches Nuxt commented-out gradient) */}
                    <div className="absolute inset-0 flex items-end">
                      <h3
                        className="text-white font-medium text-[1.25rem] leading-snug"
                        style={{
                          margin: 0,
                          padding: '8px 16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
                          overflow: 'hidden',
                          whiteSpace: 'normal',
                          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                        }}
                      >
                        {service.name}
                      </h3>
                    </div>
                  </div>

                  {/* Schedule chips — single location, non-salon */}
                  {svcSchedules.length > 0 && (
                    <div className="px-3 pt-3 pb-1">
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'rgba(0,0,0,0.87)', marginBottom: 6 }}>
                        Upcoming Classes
                      </div>
                      <div className="flex flex-wrap">
                        {svcSchedules.map((sc: any, i: number) => (
                          <Chip key={i}>
                            {SHORT_DAYS[sc.day_of_week] ?? sc.day_of_week}, {sc.pretty_start_time}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Full Schedule button — multiple locations */}
                  {!isSingleLocation && (
                    <div className="flex justify-center mt-3 mb-1">
                      <Link
                        href="/schedule"
                        className="text-center text-sm font-medium py-2 rounded block"
                        style={{ backgroundColor: '#ccc', color: accentColor, width: 160 }}
                      >
                        Full Schedule
                      </Link>
                    </div>
                  )}

                  {/* Card actions — Vuetify v-btn text style: uppercase, letter-spacing */}
                  <div className="flex items-center px-2 mt-auto" style={{ minHeight: 48 }}>
                    <Link
                      href={`/classes/${slug}/`}
                      className="text-sm font-medium uppercase"
                      style={{
                        color: accentColor,
                        letterSpacing: '0.08929em',
                        padding: '0 8px',
                        lineHeight: '36px',
                      }}
                      aria-label={`Learn more about ${service.name}`}
                    >
                      Learn more
                    </Link>
                    <button
                      onClick={() => handleSignup(service)}
                      className="text-sm font-medium uppercase"
                      style={{
                        color: accentColor,
                        letterSpacing: '0.08929em',
                        padding: '0 8px',
                        lineHeight: '36px',
                      }}
                    >
                      {isFitnessCenter ? 'Sign up' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
