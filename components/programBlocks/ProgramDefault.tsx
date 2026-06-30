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

export function ProgramDefault({ headline = "LET'S FIND THE RIGHT PROGRAM FOR YOU" }: SectionProps) {
  const organization = useOrgStore(s => s.organization)
  const locations = useOrgStore(s => s.locations)
  const setDialog = useUiStore(s => s.setDialog)
  const setSelectedPlan = useUiStore(s => s.setSelectedPlan)
  const { setInterestedService } = useInterestedServices()

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#d5242c'
  const industryType = (organization as any)?.industry_type ?? ''
  const isSalon = industryType === 'salon'
  const isFitnessCenter = industryType === 'fitness_center'
  const isSingleLocation = locations.length === 1
  const services = organization?.services ?? []

  function handleSignup(service: any) {
    setSelectedPlan(null)
    setDialog(true)
    setInterestedService(service.id)
  }

  return (
    <div className="py-20" style={{ background: 'var(--org-app-main-background, #ffffff)' }}>
      <div className="max-w-7xl mx-auto px-0 overflow-hidden">
        {headline && (
          <h2 className="block text-center my-10 text-[28px] font-bold uppercase">
            {headline}
          </h2>
        )}

        {/* no-gutters equivalent: no negative margin, mx-4 lives on the card */}
        <div className="flex flex-wrap">
          {services.map((service: any) => {
            const imgUrl = service.large_media
              ? buildMediaUrl(service.large_media)
              : service.small_media
              ? buildMediaUrl(service.small_media)
              : null
            const slug = service.slug || service.id

            return (
              <div key={service.id} className="w-full sm:w-1/2 md:w-1/3 mb-8">
                {/* mx-4 matches Nuxt's v-card class="mx-4 programBlock-card" */}
                <div className="mx-4 h-full flex flex-col bg-white rounded shadow-md overflow-hidden">

                  {/* Image area: 200px tall, relative — matches .program-card-media */}
                  <div className="relative w-full h-[200px] overflow-hidden rounded-t">
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
                    {/* Title overlay: no gradient (commented out in Nuxt), white text at bottom */}
                    <div className="absolute inset-0 flex items-end">
                      <h3
                        className="text-white font-semibold"
                        style={{
                          margin: 0,
                          padding: '4px 8px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical' as const,
                          overflow: 'hidden',
                          whiteSpace: 'normal',
                        }}
                      >
                        {service.name}
                      </h3>
                    </div>
                  </div>

                  {/* Single location: schedule chips — not shown for salon */}
                  {isSingleLocation && !isSalon && (
                    <div className="px-3 pb-2 pt-1 text-black">
                      {(service.schedules?.length ?? 0) > 0 && (
                        <div className="font-bold text-sm mb-1">Upcoming Classes</div>
                      )}
                      <div className="flex flex-wrap gap-1">
                        {(service.schedules ?? []).slice(0, 3).map((sc: any, i: number) => (
                          <span
                            key={i}
                            className="inline-block bg-gray-100 border border-gray-300 rounded-full px-2 py-[2px]"
                            style={{ fontSize: 11 }}
                          >
                            {SHORT_DAYS[sc.day_of_week] ?? sc.day_of_week}, {sc.pretty_start_time}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Multiple locations: Full Schedule button — matches Nuxt's .schedule-btn */}
                  {!isSingleLocation && (
                    <div className="flex justify-center mt-3 mb-1">
                      <Link
                        href="/schedule"
                        className="bg-[#ccc] w-[160px] text-center text-sm font-medium py-2 rounded block"
                        style={{ color: accentColor }}
                      >
                        Full Schedule
                      </Link>
                    </div>
                  )}

                  {/* Card actions: Learn more + Sign up / Book Now */}
                  <div className="flex items-center px-2 py-2 mt-auto">
                    <Link
                      href={`/classes/${slug}/`}
                      className="text-sm font-medium px-3 py-1 hover:underline"
                      style={{ color: accentColor }}
                      aria-label={`Learn more about ${service.name}`}
                    >
                      Learn more
                    </Link>
                    <button
                      onClick={() => handleSignup(service)}
                      className="text-sm font-medium px-3 py-1 hover:underline"
                      style={{ color: accentColor }}
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
