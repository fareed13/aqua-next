'use client'

import { useCallback } from 'react'

interface TrackingPayload {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_term: string | null
  utm_content: string | null
  gclid: string | null
  fbclid: string | null
  ga4_client_id: string | null
  ga4_session_id: string | null
  referrer_url: string | null
  landing_page_url: string | null
}

const DEFAULTS: TrackingPayload = {
  utm_source: 'Organic',
  utm_medium: 'None',
  utm_campaign: 'None',
  utm_term: null,
  utm_content: null,
  gclid: null,
  fbclid: null,
  ga4_client_id: null,
  ga4_session_id: null,
  referrer_url: null,
  landing_page_url: null,
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

function setCookie(name: string, value: string | null) {
  if (typeof document === 'undefined' || value == null) return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}`
}

function resolveUtmSource(
  query: Record<string, string>,
  storedValue: string | null,
): string {
  if (query.gclid) return 'google'
  if (query.fbclid) return 'fb'
  if (query.utm_source) return query.utm_source
  return storedValue || DEFAULTS.utm_source
}

function extractGa4ClientId(): string | null {
  try {
    const entry = document.cookie.split('; ').find((r) => r.startsWith('_ga='))
    if (entry) {
      const parts = entry.split('=')[1].split('.')
      if (parts.length >= 4) return `${parts[2]}.${parts[3]}`
    }
  } catch {}
  return null
}

function extractGa4SessionId(): string | null {
  try {
    const entry = document.cookie.split('; ').find((r) => /^_ga_/.test(r))
    if (entry) {
      const parts = entry.split('=').slice(1).join('=').split('.')
      if (parts.length >= 3) return parts[2]
    }
  } catch {}
  return null
}

export function useTracking() {
  const initTrackingCookies = useCallback(
    (query: Record<string, string> = {}) => {
      if (typeof window === 'undefined') return

      if (query.gclid) setCookie('gclid', query.gclid)
      if (query.fbclid) setCookie('fbclid', query.fbclid)

      setCookie('utm_source', resolveUtmSource(query, getCookie('utm_source')))

      if (query.utm_medium) setCookie('utm_medium', query.utm_medium)
      else if (!getCookie('utm_medium')) setCookie('utm_medium', DEFAULTS.utm_medium)

      if (query.utm_campaign) setCookie('utm_campaign', query.utm_campaign)
      else if (!getCookie('utm_campaign')) setCookie('utm_campaign', DEFAULTS.utm_campaign)

      if (query.utm_term) setCookie('utm_term', query.utm_term)
      if (query.utm_content) setCookie('utm_content', query.utm_content)

      if (!getCookie('referrer_url')) setCookie('referrer_url', document.referrer || null)
      if (!getCookie('landing_page_url')) setCookie('landing_page_url', window.location.href || null)
      if (!getCookie('ga4_client_id')) setCookie('ga4_client_id', extractGa4ClientId())
      if (!getCookie('ga4_session_id')) setCookie('ga4_session_id', extractGa4SessionId())
    },
    [],
  )

  const getTrackingPayload = useCallback(
    (query: Record<string, string> = {}): TrackingPayload => {
      return {
        utm_source: resolveUtmSource(query, getCookie('utm_source')),
        utm_medium: query.utm_medium || getCookie('utm_medium') || DEFAULTS.utm_medium,
        utm_campaign: query.utm_campaign || getCookie('utm_campaign') || DEFAULTS.utm_campaign,
        utm_term: query.utm_term || getCookie('utm_term') || DEFAULTS.utm_term,
        utm_content: query.utm_content || getCookie('utm_content') || DEFAULTS.utm_content,
        gclid: query.gclid || getCookie('gclid') || DEFAULTS.gclid,
        fbclid: query.fbclid || getCookie('fbclid') || DEFAULTS.fbclid,
        ga4_client_id: getCookie('ga4_client_id') || DEFAULTS.ga4_client_id,
        ga4_session_id: getCookie('ga4_session_id') || DEFAULTS.ga4_session_id,
        referrer_url: getCookie('referrer_url') || DEFAULTS.referrer_url,
        landing_page_url: getCookie('landing_page_url') || DEFAULTS.landing_page_url,
      }
    },
    [],
  )

  return { initTrackingCookies, getTrackingPayload, DEFAULTS }
}
