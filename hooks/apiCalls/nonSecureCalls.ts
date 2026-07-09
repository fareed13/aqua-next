'use client'

import { useCallback } from 'react'
import { publicClient } from '@/lib/api/publicClient'

export const NON_SECURE_ENDPOINTS = {
  CUSTOMER_AGREEMENTS: '/customer/agreement/',
  BRAINTREE_TOKEN: '/customer/braintree_token/',
  SQUARE_TOKEN: '/customer/square_token/',
  STRIPE_CREDS: '/location/stripe-creds',
  EVENT_PURCHASE: '/customer/event-purchase/',
  CUSTOMER_PURCHASE: '/customer/purchase/',
  GIFTCARD_PURCHASE: '/giftcard/gcp/',
  SERVICE_FAQ: '/service/get-faq/',
  META_TAGS: '/website/metatags/',
  PUBLIC_SCHEDULE: '/schedule/public/',
  DOWNLOAD_AGREEMENT: '/customer/agreement/download/',
  NEAREST_LOCATION_FINDER: '/location/find/',
  OTP_VERIFICATION: '/cognitoauth/otp/',
  USER_LOGIN_END_POINT: '/cognitoauth/login/',
  HUBSPOT_TICKET_ENDPOINT: '/location/payment/method/hubspot/',
  SCHEDULE_SLOTS: '/booking/schedule/datetime/slot/',
  BOOKING_APPOINTMENT: '/booking/appointment/',
  ORGANIZATION_STATUS: '/organization/status/',
  GOOGLERECAPTCHA: '/customer/verify/recaptcha/',
  FREE_EVENT_TRACK: '/customer/event-free/',
  FREE_PLAN_TRACK: '/customer/plan-free/',
  CUSTOMER_CREATE: '/customer/create/',
  PUBLIC_STATE: '/library/states/',
  INSTAGRAM_FEED: '/gmb/instagram/feed/',
  PDF: '/organization/pdf-documents/public/',
  CHATBOT: '/chatbot/stepper/',
  CHATBOT_MESSAGE_REACTION: '/chatbot/answerreviews/',
} as const

type Params = Record<string, string | number | boolean | undefined>

/**
 * Public / non-secure API calls. organization_id is injected centrally by publicClient;
 * the login token is intentionally NOT attached (mirrors Nuxt nonSecureCalls). Endpoints that
 * require a recaptcha/purchase token use *Protected variants which pass Authorization explicitly.
 */
export function useNonSecureCalls() {
  const getPublic = useCallback(
    <T = unknown>(url: string, params: Params = {}) => publicClient.get<T>(url, { params }),
    [],
  )

  const postPublic = useCallback(
    <T = unknown>(url: string, data: unknown, params: Params = {}) =>
      publicClient.post<T>(url, data, { params }),
    [],
  )

  const putPublic = useCallback(
    <T = unknown>(url: string, data: unknown, params: Params = {}) =>
      publicClient.put<T>(url, data, { params }),
    [],
  )

  const deletePublic = useCallback(
    <T = unknown>(url: string, params: Params = {}) => publicClient.delete<T>(url, { params }),
    [],
  )

  const postPublicProtected = useCallback(
    <T = unknown>(url: string, data: unknown, authHeader: string, params: Params = {}) =>
      publicClient.post<T>(url, data, { params, headers: { Authorization: authHeader } }),
    [],
  )

  const getPublicProtected = useCallback(
    <T = unknown>(url: string, authHeader: string, params: Params = {}) =>
      publicClient.get<T>(url, { params, headers: { Authorization: authHeader } }),
    [],
  )

  return {
    nonSecureEndpoint: NON_SECURE_ENDPOINTS,
    getPublic,
    postPublic,
    putPublic,
    deletePublic,
    postPublicProtected,
    getPublicProtected,
  }
}
