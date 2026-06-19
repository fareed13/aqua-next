'use client'

import { useCallback } from 'react'

function getCookie(name: string): number[] | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match.split('=')[1]))
  } catch {
    return null
  }
}

function setCookie(name: string, value: number[]) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${60 * 60 * 24 * 365}`
}

export function useInterestedServices() {
  const setInterestedService = useCallback((serviceId: number | null) => {
    if (serviceId === null) return
    const current = getCookie('interested_services')
    if (!current) {
      setCookie('interested_services', [serviceId])
    } else if (!current.includes(serviceId)) {
      setCookie('interested_services', [...current, serviceId])
    } else {
      setCookie('interested_services', [
        ...current.filter((s) => s !== serviceId),
        serviceId,
      ])
    }
  }, [])

  const getInterestedServices = useCallback((): number[] => {
    return getCookie('interested_services') ?? []
  }, [])

  return { setInterestedService, getInterestedServices }
}
