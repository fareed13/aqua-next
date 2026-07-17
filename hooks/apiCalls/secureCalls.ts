'use client'

import { useCallback } from 'react'
import { secureClient } from '@/lib/api/secureClient'

export const SECURE_ENDPOINTS = {
  RESERVATIONS: '/booking/class/reservations/',
  CUSTOMER: '/customer/',
  CUSTOMER_LITE: '/customer/lite/',
  CUSTOMER_CREATE: '/customer/create/',
  AGREEMENTS: '/organization/agreement/',
  BLOG: '/location/blog/',
  COMPONENT: '/library/component/',
  USER: '/user/crud/',
  STAFF: '/staff/',
  SERVICE: '/service/',
  SCHEDULE: '/schedule/',
  ORG_REVIEW: '/organization/org-review/',
  PLAN: '/plan/',
  PAGE: '/location/page/',
  ORGANIZATION: '/organization/',
  LOCATION: '/location/',
  LOCATION_SECURE: '/location/secure/',
  EVENTS: '/location/event/',
  CURRICULUM: '/schedule/curriculum/',
  MEDIA: '/media/',
  FAQ: '/service/faqs/',
  BLOGS_REORDER: '/location/blog/bulk/',
  EVENT_PURCHASE: '/customer/event-purchase/',
  FREE_EVENT_TRACK: '/customer/event-free/',
  CHATBOT: '/chatbot/',
  COMMUNICATION: '/communication/',
  GET_SERVICES: '/service/',
  SERVICE_BULK: '/service/bulk/',
  SERVICE_GUIDED_FLOW: '/service/guided-flow/',
  SERVICE_INTRO: '/library/serviceintro/',
  SERVICE_TOPIC: '/library/servicetopic/',
  SERVICE_TYPE: '/library/servicetype/',
  CUSTOMER_BULK_UPLOAD: '/customer/bulk-upload/',
  CUSTOMER_AGREEMENTS: '/customer/agreement/',
  ATTENDANCE: '/booking/attendance/',
  AUTOMATION: '/organization/automation/',
  BACKGROUND: '/library/background/',
  SOCIAL_MEDIA: '/organization/social-media/',
  COMMUNICATION_TEMPLATES: '/communication/template/',
  RESERVED_SCHEDULE: '/booking/class/reservations/',
  SERVICE_RANK: '/service/rank/',
  PLAN_PURCHASED: '/plan/plan_purchased/',
  SERVICE_PLAN_BULK_UPDATE: '/service/plan/bulk/',
  ITEMS: '/library/dropdown/plan-items',
  ORGANIZATION_PWA: '/organization/pwa/',
  ORGANIZATION_STATUS: '/organization/status/',
  AI_TEXT: '/ai/text/',
  AD_TEXT: '/organization/ad-text/',
  NOTES: '/customer/notes/',
  LOCATION_AQUILA_SETUP: '/location/aquila-setup/',
  LOCATION_AQUILA_PAYMENT_SETUP: '/location/aquila-payment-setup/',
  INVOKE_AQUILA: '/customer/invoke-aquila/',
  LIBRARY_CLR_SCHEME: '/library/color-scheme/',
  LIBRARY_AD_TEMPLATE: '/library/ad-template/',
  LESSON: '/schedule/lesson/',
  KEYWORD_RANKING: '/organization/keyword-ranking/',
  GUIDED_FLOW: '/organization/guided-flow/',
  GOOGLE_ADS: '/ads/google/',
  GIFT_CARD: '/giftcard/',
  FB_ADS: '/ads/facebook/',
  TARGET_AUDIENCE: '/ads/target-audience/',
  ADS_PREVIEW: '/ads/preview/',
  BULK_MEMBER_UPLOAD: '/customer/bulk-upload/',
  CUSTOMER_BUILDER: '/customer/rank_log/',
  CUSTOMER_CONTACT: '/customer/emergency_contact/',
  CUSTOMER_USER: '/user/',
  CUSTOMER_SEND_MSG: '/customer/send-message/',
  ATTENDANCE_REPORT: '/report/attendance/',
  NO_SHOW_REPORT: '/report/no-show/',
  NEW_MEMBER_REPORT: '/report/new-member/',
  RENEWAL_REPORT: '/report/renewal/',
  BIRTHDAY_REPORT: '/report/birthday/',
  ABBI_LEADS_REPORT: '/report/abbi-leads/',
  LEADS_ANALYTICS_USER: '/analytics/leads/user/',
  LEADS_ANALYTICS_PAGE_VIEWS: '/analytics/leads/page-views/',
  LEADS_CONVERSION_DEVICE: '/report/abbi-leads/conversion-device/',
  LEADS_CONVERSION_DAY: '/report/abbi-leads/conversion-days/',
  LEADS_CHANEL_GROUPING: '/analytics/leads/channel-grouping/',
  GOOGLE_SETUP: '/gmb/setup/',
  GOOGLE_REPLY: '/gmb/reply/',
  RANKING_CHART: '/organization/ranking-chart/',
  CUSTOMSCRIPTS_LIST: '/organization/custom-script/',
  ANALYTICS_USERS: '/analytics/users/',
  ANALYTICS_LEADS: '/analytics/leads/',
  ANALYTICS_TRIALS: '/analytics/trials/',
  ANALYTICS_USERS_BY_PAGES: '/analytics/users-by-pages/',
  ANALYTICS_AREAS: '/analytics/areas/',
  ANALYTICS_PROGRAMS: '/analytics/programs/',
  ANALYTICS_LEADS_AND_PURCHASES: '/analytics/leads-and-purchases/',
  BOOKED_APPOINTMENTS: '/booking/appointment/',
  STATE: '/library/state/',
  DOWNLOAD_AGREEMENT: '/customer/agreement/download/',
  ANALYTICS_ALL: '/analytics/all/',
  GMB_LOCATION_LIST: '/gmb/location/',
  GMB_ALL_LOCATION_LIST: '/gmb/all-location/',
  GMB_CREATE_POST: '/gmb/post/',
  GMB_CRUD_AUTOMATION: '/gmb/automation/',
  GMB_MONITORING_LIST: '/gmb/monitoring/',
  GMB_ALL_ACCOUNT: '/gmb/account/',
  GMB_GROUP_ACCOUNT_LOCATIONS: '/gmb/group-account-locations/',
  SPAM_BULK_DELETE: '/customer/bulk-delete/',
  GET_INSTA_AUTH: '/gmb/instagram/auth/',
  GMB_MEDIA: '/gmb/media/',
  SCHEDULE_UPLOAD: '/schedule/upload/',
  SCHEDULE_BULK_CREATE: '/schedule/bulk-create/',
  REMOVE_FROM_SPAM: '/customer/update-tag/',
  TEST_INTEGRATION: '/organization/test-integration/',
  PDF: '/organization/pdf-documents/',
  PAGE_META: '/website/metatags/',
  REDIRECT: '/organization/redirect/',
  EXTERNAL_LEAD_INTEGRATION: '/organization/external-lead-integration/',
  DASHBOARD_COMPLETION_PERCENTAGE: '/dashboard/completion-percentage/',
  DASHBOARD_LEAD_REVENUE_STATS: '/dashboard/lead-revenue-stats/',
  DASHBOARD_GRAPHICAL_STATS: '/dashboard/graphical-stats/',
  DASHBOARD_ANALYTICS_STATS: '/dashboard/analytics-stats/',
  DASHBOARD_EMAIL_REPORT: '/dashboard/email-report/',
  GMB_RESYNC_ORGANIZATIONS: '/gmb/resync/',
  PAGE_SPEED_RESULTS: '/website/pagespeed/',
  FAMILY_STATUS: '/customer/family-status/',
  INTERESTS: '/customer/interests/',
  AUDIENCE: '/customer/audience/',
  TAGS: '/library/tags/',
  SUBSCRIPTION: '/customer/subscription/',
  CLOSED_DATE: '/schedule/closed-date/',
} as const

type Params = Record<string, string | number | boolean | undefined>

/**
 * Authenticated API calls. secureClient injects the Bearer login token + organization_id
 * centrally, so nothing here computes headers per call.
 */
export function useSecureCalls() {
  const getSecure = useCallback(
    <T = unknown>(url: string, params: Params = {}) => secureClient.get<T>(url, { params }),
    [],
  )

  const postSecure = useCallback(
    <T = unknown>(url: string, data: unknown, params: Params = {}) =>
      secureClient.post<T>(url, data, { params }),
    [],
  )

  const putSecure = useCallback(
    <T = unknown>(url: string, data: unknown, params: Params = {}) =>
      secureClient.put<T>(url, data, { params }),
    [],
  )

  const patchSecure = useCallback(
    <T = unknown>(url: string, data: unknown, params: Params = {}) =>
      secureClient.patch<T>(url, data, { params }),
    [],
  )

  // Preserves the existing signature: second arg is passed through as the body { id }.
  const deleteSecure = useCallback(
    <T = unknown>(url: string, id: unknown, params: Params = {}) =>
      secureClient.delete<T>(url, { params, body: { id } }),
    [],
  )

  // Binary responses (e.g. agreement PDF download) — returns an ArrayBuffer.
  const postSecureBuffer = useCallback(
    <T = unknown>(url: string, data: unknown, params: Params = {}) =>
      secureClient.post<T>(url, data, { params, responseType: 'arraybuffer' }),
    [],
  )

  return {
    secureEndpoint: SECURE_ENDPOINTS,
    getSecure,
    postSecure,
    putSecure,
    patchSecure,
    deleteSecure,
    postSecureBuffer,
  }
}
