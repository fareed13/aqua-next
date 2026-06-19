'use client'

import { useMemo, useCallback } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useSchedule } from './useSchedule'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Service, Schedule } from '@/types/api'

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

const DAYS_MAP: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
}

export function useProgramBlocks() {
  const organization = useOrgStore(s => s.organization)
  const services = organization?.services ?? []
  const setDialog = useUiStore(s => s.setDialog)
  const scheduleHook = useSchedule()

  const arrangeSchedule = useCallback((svc: Service): Schedule[] => {
    const days: string[] = []
    for (let i = 0; i < 7; i++) {
      days.push(DAYS_MAP[addDays(new Date(), i).getDay()])
    }
    const allSchedules = days.flatMap(
      k => (scheduleHook.schedule as any)?.[k] ?? []
    )
    return allSchedules.filter((sch: Schedule) => sch.service?.id === svc.id)
  }, [scheduleHook.schedule])

  const programs = useMemo(() => {
    const rootServices = services.filter(s => s.parent_service === null)
    return rootServices
      .filter(svc => svc.large_media?.uuid)
      .map(svc => ({
        id: svc.id,
        name: svc.name,
        url: `/classes/${svc.slug}`,
        img: buildMediaUrl(svc.large_media, 700),
        schedules: arrangeSchedule(svc),
      }))
  }, [services, arrangeSchedule])

  return {
    ...scheduleHook,
    services,
    programs,
    arrangeSchedule,
    setDialog,
  }
}
