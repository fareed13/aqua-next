'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useOrgStore } from '@/store/orgStore'
import type { Location, Schedule } from '@/types/api'

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
] as const

type DayOfWeek = (typeof DAYS_OF_WEEK)[number]
type DayScheduleMap = Record<DayOfWeek, Schedule[]>

const EMPTY_SCHEDULE: DayScheduleMap = {
  monday: [], tuesday: [], wednesday: [], thursday: [],
  friday: [], saturday: [], sunday: [],
}

const DAY_KEY_MAP: Record<string, DayOfWeek> = {
  Monday: 'monday', Tuesday: 'tuesday', Wednesday: 'wednesday',
  Thursday: 'thursday', Friday: 'friday', Saturday: 'saturday', Sunday: 'sunday',
}

function loadLocationSchedule(loc: Location): DayScheduleMap {
  const result = { ...EMPTY_SCHEDULE }
  for (const [apiDay, localDay] of Object.entries(DAY_KEY_MAP)) {
    result[localDay] = (loc.day_schedules as Record<string, Schedule[]>)?.[apiDay] ?? []
  }
  return result
}

export function useSchedule() {
  const locations = useOrgStore((s) => s.locations)
  const location = useOrgStore((s) => s.location)

  const [activeTab, setActiveTab] = useState(0)
  const [virtual, setVirtual] = useState(false)
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  const [schedule, setSchedule] = useState<DayScheduleMap>(EMPTY_SCHEDULE)
  const [scheduleFound, setScheduleFound] = useState(false)

  const filteredLocations = useMemo(() => {
    return (locations ?? []).filter((loc) =>
      Object.values(loc.day_schedules ?? {}).some((arr) => (arr as Schedule[]).length > 0),
    )
  }, [locations])

  const selectLocation = useCallback(
    (id: number) => {
      setSelectedLocationId(id)
      const target = (locations ?? []).find((l) => l.id === id)
      if (target) {
        setSchedule(loadLocationSchedule(target))
        setScheduleFound(true)
      }
    },
    [locations],
  )

  useEffect(() => {
    if (location?.id && !selectedLocationId) {
      selectLocation(location.id)
    }
  }, [location, selectedLocationId, selectLocation])

  return {
    activeTab,
    setActiveTab,
    virtual,
    setVirtual,
    daysOfWeek: DAYS_OF_WEEK,
    schedule,
    scheduleFound,
    selectedLocationId,
    selectLocation,
    filteredLocations,
    locations: locations ?? [],
    location,
  }
}
