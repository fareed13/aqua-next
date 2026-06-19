'use client'

import { useMemo } from 'react'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { ReviewsClean } from '@/components/reviews/ReviewsClean'
import { InstructorDefault } from '@/components/instructor/InstructorDefault'
import { FaqDefault } from '@/components/faqs/FaqDefault'
import { ServicePlans } from '@/components/sections/ServicePlans'
import { LandingPageBanner } from '@/components/carousel/LandingPageBanner'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Service, ComponentContent } from '@/types/api'

interface ServiceDetailProps {
  service: Service
  serviceName: string
  showProgramChildren?: boolean
}

function processSection(
  section: ComponentContent,
  serviceName: string,
  location1: string,
): ComponentContent {
  const processed = { ...section }

  if (processed.headline) {
    processed.headline = processed.headline
      .replace(/#serviceName#/g, serviceName)
      .replace(/#classes#/g, 'classes')
      .replace(/#location1#/g, location1)
  }
  if (processed.subtitle) {
    processed.subtitle = processed.subtitle
      .replace(/#serviceName#/g, serviceName)
      .replace(/#classes#/g, 'classes')
      .replace(/#location1#/g, location1)
  }
  if (processed.content) {
    processed.content = processed.content
      .replace(/#serviceName#/g, serviceName)
      .replace(/#classes#/g, 'classes')
      .replace(/#location1#/g, location1)
  }
  if (!processed.media && !processed.component) {
    processed.component = 'FadedNoImage'
  }

  return processed
}

export function ServiceDetail({ service, serviceName, showProgramChildren }: ServiceDetailProps) {
  const organization = useOrgStore(s => s.organization)
  const location = useOrgStore(s => s.location)
  const location1 = location?.target_locations?.[0] ?? ''

  const backgroundImage = service.large_media
    ? buildMediaUrl(service.large_media, 700)
    : ''

  const sections = useMemo(() => {
    if (!service.content) return []
    return service.content.map(s => processSection({ ...s }, serviceName, location1))
  }, [service.content, serviceName, location1])

  const isBannerEnabled = organization?.is_landing_page_banner_enabled !== false

  return (
    <div className={!isBannerEnabled ? 'pt-[110px] max-[767px]:pt-[155px]' : undefined}>
      {isBannerEnabled && (
        <LandingPageBanner
          component="LandingPageBanner"
          headline={serviceName}
          backgroundImage={backgroundImage}
        />
      )}

      {sections.map((section, i) => (
        <SectionRenderer key={i} section={section} />
      ))}

      <ReviewsClean component="ReviewsClean" />

      {showProgramChildren && (
        <ProgramChildren serviceId={service.id} services={organization?.services ?? []} />
      )}

      <InstructorDefault component="InstructorDefault" />
      <FaqDefault component="FaqDefault" />
      <ServicePlans component="ServicePlans" />
    </div>
  )
}

function ProgramChildren({
  serviceId,
  services,
}: {
  serviceId: number
  services: Service[]
}) {
  const children = services.filter(
    s => s.parent_service && (s.parent_service as any).id === serviceId
  )

  if (children.length === 0) return null

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-around">
          {children.map((child, i) => (
            <div
              key={i}
              className="text-center rounded-[10px] p-[30px_20px] h-full"
              style={{ backgroundColor: 'var(--org-primary, #1a3a4a)' }}
            >
              <h4
                className="text-[#f5f5f5] text-4xl font-bold leading-none"
                style={{ fontFamily: 'Khand, sans-serif' }}
              >
                {child.min_age} to {child.max_age}
              </h4>
              <h3 className="text-[#c2e2f5] text-[60px] leading-none">{child.name}</h3>
              <p className="text-[#f5f5f5] text-lg leading-none pt-5">
                {child.short_description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
