import type { Organization, Page } from '@/types/api'

const DEFAULT_LOCATION_ID = Number(process.env.NEXT_PUBLIC_ABBI_DEFAULT_LOCATION_ID ?? NaN)

/** Global (template) pages belong to the Abbi default location and are shared across orgs. */
export function isGlobalPage(page: Page): boolean {
  return page.location === DEFAULT_LOCATION_ID || page.slug === 'homepage'
}

export function checkPageInMenu(organization: Organization, page: Page): boolean {
  return !!organization.additional_headers?.find(ah => ah.text === page.name)
}
