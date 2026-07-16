import type { Organization, Page } from '@/types/api'

// Deliberately a STRING, and deliberately never coerced to a number.
//
// Nuxt reads this from runtimeConfig (netlify-env.js passes process.env straight
// through, unlike DEBUG which it explicitly coerces), so it compares a numeric
// `page.location` against the string "2" — a strict-equality check that can never
// match. `is_global_page` is therefore effectively `page.slug === 'homepage'`.
//
// Number()-coercing here looks like a bug fix but silently changes behaviour: the
// API returns location === 2 for 9 org-level pages (events, contact, schedule,
// facilities, locations, privacy-policy, refund-policy, terms-of-service,
// thank-you). Coerced, every one of them becomes "global" and loses the Edit Page /
// Delete Page / Add Section / Reorder controls that Nuxt shows on them.
// Keep the type mismatch so the comparison stays false, exactly as in Nuxt.
const DEFAULT_LOCATION_ID: string = process.env.NEXT_PUBLIC_ABBI_DEFAULT_LOCATION_ID ?? ''

/** Mirrors Nuxt's is_global_page — in practice true only for the homepage. */
export function isGlobalPage(page: Page): boolean {
  return (page.location as unknown as string) === DEFAULT_LOCATION_ID || page.slug === 'homepage'
}

export function checkPageInMenu(organization: Organization, page: Page): boolean {
  return !!organization.additional_headers?.find(ah => ah.text === page.name)
}

/** Mirrors Nuxt's check_content_http — blocks saving editor content with insecure links. */
export function checkContentHttp(content: string | null | undefined): boolean {
  return !!content && content.includes('http://')
}
