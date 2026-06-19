'use client'

import { useCallback } from 'react'
import { apiClient } from '@/lib/api/fetchClient'
import { useOrgStore } from '@/store/orgStore'

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

export const SECURE_ENDPOINTS = {
  RESERVATIONS: '/booking/class/reservations/',
  CUSTOMER: '/customer/',
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
  SERVICE_INTRO: '/service/intro/',
  SERVICE_TOPIC: '/service/topic/',
  SERVICE_TYPE: '/service/type/',
  CUSTOMER_BULK_UPLOAD: '/customer/bulk-upload/',
  CUSTOMER_AGREEMENTS: '/customer/agreement/',
  ATTENDANCE: '/customer/attendance/',
  AUTOMATION: '/organization/automation/',
  BACKGROUND: '/library/background/',
  SOCIAL_MEDIA: '/organization/social-media/',
  COMMUNICATION_TEMPLATES: '/communication/template/',
  RESERVED_SCHEDULE: '/booking/class/reservations/',
  SERVICE_RANK: '/service/rank/',
  PLAN_PURCHASED: '/customer/plan-purchased/',
  SERVICE_PLAN_BULK_UPDATE: '/service/plan/bulk/',
  ITEMS: '/plan/items/',
  ORGANIZATION_PWA: '/organization/pwa/',
  ORGANIZATION_STATUS: '/organization/status/',
  AI_TEXT: '/organization/ai-text/',
  AD_TEXT: '/organization/ad-text/',
  NOTES: '/customer/notes/',
  LOCATION_AQUILA_SETUP: '/location/aquila-setup/',
  LOCATION_AQUILA_PAYMENT_SETUP: '/location/aquila-payment-setup/',
  INVOKE_AQUILA: '/location/invoke-aquila/',
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
  CUSTOMER_BUILDER: '/customer/builder/',
  CUSTOMER_CONTACT: '/customer/contact/',
  CUSTOMER_USER: '/customer/user/',
  CUSTOMER_SEND_MSG: '/customer/send-msg/',
  ATTENDANCE_REPORT: '/report/attendance/',
  NO_SHOW_REPORT: '/report/no-show/',
  NEW_MEMBER_REPORT: '/report/new-member/',
  RENEWAL_REPORT: '/report/renewal/',
  BIRTHDAY_REPORT: '/report/birthday/',
  ABBI_LEADS_REPORT: '/report/abbi-leads/',
  LEADS_ANALYTICS_USER: '/analytics/leads/user/',
  LEADS_ANALYTICS_PAGE_VIEWS: '/analytics/leads/page-views/',
  LEADS_CONVERSION_DEVICE: '/analytics/leads/conversion-device/',
  LEADS_CONVERSION_DAY: '/analytics/leads/conversion-day/',
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
  STATE: '/library/states/',
  DOWNLOAD_AGREEMENT: '/customer/agreement/download/',
  ANALYTICS_ALL: '/analytics/all/',
  GMB_LOCATION_LIST: '/gmb/location/',
  GMB_ALL_LOCATION_LIST: '/gmb/all-location/',
  GMB_CREATE_POST: '/gmb/post/',
  GMB_CRUD_AUTOMATION: '/gmb/automation/',
  GMB_MONITORING_LIST: '/gmb/monitoring/',
  GMB_ALL_ACCOUNT: '/gmb/account/',
  GMB_GROUP_ACCOUNT_LOCATIONS: '/gmb/group-account-locations/',
  SPAM_BULK_DELETE: '/customer/spam/bulk-delete/',
  GET_INSTA_AUTH: '/gmb/instagram/auth/',
  GMB_MEDIA: '/gmb/media/',
  SCHEDULE_UPLOAD: '/schedule/upload/',
  SCHEDULE_BULK_CREATE: '/schedule/bulk-create/',
  REMOVE_FROM_SPAM: '/customer/spam/remove/',
  TEST_INTEGRATION: '/organization/test-integration/',
  PDF: '/organization/pdf-documents/',
  PAGE_META: '/website/metatags/',
  REDIRECT: '/organization/redirect/',
  EXTERNAL_LEAD_INTEGRATION: '/organization/external-lead-integration/',
  DASHBOARD_COMPLETION_PERCENTAGE: '/analytics/dashboard/completion/',
  DASHBOARD_LEAD_REVENUE_STATS: '/analytics/dashboard/lead-revenue/',
  DASHBOARD_GRAPHICAL_STATS: '/analytics/dashboard/graphical/',
  DASHBOARD_ANALYTICS_STATS: '/analytics/dashboard/analytics/',
  DASHBOARD_EMAIL_REPORT: '/analytics/dashboard/email-report/',
  GMB_RESYNC_ORGANIZATIONS: '/gmb/resync/',
  PAGE_SPEED_RESULTS: '/analytics/page-speed/',
  FAMILY_STATUS: '/customer/family-status/',
  INTERESTS: '/customer/interests/',
  AUDIENCE: '/customer/audience/',
  TAGS: '/customer/tags/',
  SUBSCRIPTION: '/customer/subscription/',
  CLOSED_DATE: '/schedule/closed-date/',
} as const

export function useNonSecureCalls() {
  const orgId = useOrgStore((s) => s.organization?.id)

  const getPublic = useCallback(
    <T = unknown>(url: string, params: Record<string, string | number | boolean | undefined> = {}) =>
      apiClient.get<T>(url, { params: { organization_id: orgId, ...params } }),
    [orgId],
  )

  const postPublic = useCallback(
    <T = unknown>(url: string, data: unknown, params: Record<string, string | number | boolean | undefined> = {}) =>
      apiClient.post<T>(url, data, { params: { organization_id: orgId, ...params } }),
    [orgId],
  )

  const putPublic = useCallback(
    <T = unknown>(url: string, data: unknown, params: Record<string, string | number | boolean | undefined> = {}) =>
      apiClient.put<T>(url, data, { params: { organization_id: orgId, ...params } }),
    [orgId],
  )

  const deletePublic = useCallback(
    <T = unknown>(url: string, params: Record<string, string | number | boolean | undefined> = {}) =>
      apiClient.delete<T>(url, { params: { organization_id: orgId, ...params } }),
    [orgId],
  )

  return {
    nonSecureEndpoint: NON_SECURE_ENDPOINTS,
    getPublic,
    postPublic,
    putPublic,
    deletePublic,
  }
}

export function useSecureCalls() {
  const orgId = useOrgStore((s) => s.organization?.id)

  const getSecure = useCallback(
    <T = unknown>(url: string, params: Record<string, string | number | boolean | undefined> = {}) =>
      apiClient.get<T>(url, { params: { organization_id: orgId, ...params } }),
    [orgId],
  )

  const postSecure = useCallback(
    <T = unknown>(url: string, data: unknown, params: Record<string, string | number | boolean | undefined> = {}) =>
      apiClient.post<T>(url, data, { params: { organization_id: orgId, ...params } }),
    [orgId],
  )

  const putSecure = useCallback(
    <T = unknown>(url: string, data: unknown, params: Record<string, string | number | boolean | undefined> = {}) =>
      apiClient.put<T>(url, data, { params: { organization_id: orgId, ...params } }),
    [orgId],
  )

  const deleteSecure = useCallback(
    <T = unknown>(url: string, id: number, params: Record<string, string | number | boolean | undefined> = {}) =>
      apiClient.delete<T>(url, {
        params: { organization_id: orgId, ...params },
        body: { id },
      } as any),
    [orgId],
  )

  return {
    secureEndpoint: SECURE_ENDPOINTS,
    getSecure,
    postSecure,
    putSecure,
    deleteSecure,
  }
}
