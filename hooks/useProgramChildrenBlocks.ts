'use client'

import { useMemo } from 'react'
import { useOrgStore } from '@/store/orgStore'
import type { Service } from '@/types/api'

interface UseProgramChildrenBlocksProps {
  headline?: string
  subtitle?: string
  service_id?: number | null
}

export function useProgramChildrenBlocks(props: UseProgramChildrenBlocksProps = {}) {
  const organization = useOrgStore(s => s.organization)
  const services = organization?.services ?? []

  const programBackground = `${process.env.NEXT_PUBLIC_MEDIA_URL ?? ''}/our-program-bg.png`

  const childrenServices = useMemo(() => {
    const serviceId = props.service_id
    if (serviceId === null || serviceId === undefined) return []
    return services.filter(
      (x) => x.parent_service && (x.parent_service as any).id === serviceId
    )
  }, [services, props.service_id])

  return {
    services,
    programBackground,
    childrenServices,
  }
}
