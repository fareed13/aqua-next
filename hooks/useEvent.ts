'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from './useAuth'
import type { LocationEvent } from '@/types/api'

interface FormattedEvent extends LocationEvent {
  start_date: string
  end_date: string
}

export function useEvent() {
  const organization = useOrgStore(s => s.organization)
  const location = useOrgStore(s => s.location)
  const setDialog = useUiStore(s => s.setDialog)
  const { isStatusMember, isAdminLoggedIn } = useAuth()

  const locationEvents = location?.location_events ?? []

  const [events, setEvents] = useState<FormattedEvent[]>([])

  const loadEvents = useCallback(() => {
    try {
      const sorted = [...locationEvents].sort(
        (a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
      )
      const formatted = sorted.map(element => {
        const startDate = new Date(element.start_datetime)
        const endDate = new Date(element.end_datetime)
        return {
          ...element,
          start_date: `${startDate.toLocaleDateString('en-US')} at ${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
          end_date: `${endDate.toLocaleDateString('en-US')} at ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
        }
      })
      setEvents(formatted)
    } catch (err) {
      console.error(err)
    }
  }, [locationEvents])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const buyEvent = useCallback((event: LocationEvent) => {
    setDialog(true)
  }, [setDialog])

  const arrangeEventPrice = useCallback((event: LocationEvent | null) => {
    const result = { price: '', disability: false }
    if (event && (event.price || event.member_price)) {
      if (isStatusMember()) {
        result.price = event.member_price || event.price
        result.disability = false
      } else {
        result.price = event.price || ''
        if (!event.price || isAdminLoggedIn()) result.disability = true
      }
    } else {
      result.disability = true
    }
    return result
  }, [isStatusMember, isAdminLoggedIn])

  return {
    events,
    loadEvents,
    buyEvent,
    arrangeEventPrice,
    setDialog,
  }
}
