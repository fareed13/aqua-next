import type { Organization, Location } from '@/types/api'

export interface MenuItem {
  name: string
  url?: string
  external?: boolean
  icon?: string
  children?: MenuItem[]
}

/**
 * Builds the public navigation menu from org/location data.
 * Ported from useHeaderHelper.getDefaultMenu + getAdditionalHeaders.
 * Pure function — no store access, safe to call anywhere.
 */
export function buildMenuItems(
  organization: Organization,
  location: Location,
  locations: Location[],
  isLoggedIn = false,
  domain = '',
): MenuItem[] {
  const menu: MenuItem[] = []

  // Services → classes dropdown
  const topLevelServices = organization.services?.filter((s) => !s.parent_service) ?? []
  if (topLevelServices.length > 0) {
    menu.push({
      name: organization.school_type ?? 'Fitness Classes',
      children: topLevelServices.map((s) => ({
        name: s.name,
        url: `/classes/${s.slug}/`,
        icon: 'book-open',
      })),
    })
  }

  // Multiple locations → locations dropdown
  if (locations.length > 1) {
    menu.push({
      name: 'Locations',
      url: '/locations',
      icon: 'map-pin',
      children: locations.map((loc) => ({
        name: loc.target_locations?.[0] ?? loc.city,
        url: `/location/${loc.slug.toLowerCase()}`,
        icon: 'book-open',
      })),
    })
  }

  // Reviews
  if ((organization.org_reviews_count ?? 0) > 0) {
    menu.push({ name: 'Reviews', url: '/reviews', icon: 'star' })
  }

  // Instructors / Stylists / Team
  if ((organization.staffs?.length ?? 0) > 0) {
    const staffs = organization.staffs
    let label: string
    if (organization.industry_type === 'salon') {
      label = staffs.length > 1 ? 'Stylists' : 'Stylist'
    } else if (organization.industry_type === 'accounting') {
      label = 'Our Team'
    } else {
      label = staffs.length > 1 ? 'Instructors' : 'Instructor'
    }
    // Override if set on location
    const urlPath = staffs.length === 1 ? `/instructors/${staffs[0].slug}` : '/instructors'
    menu.push({
      name: location.instructor_text_override || label,
      url: urlPath,
      icon: 'graduation-cap',
    })
  }

  // Schedule
  if (organization.industry_type === 'fitness_center') {
    if (location.schedules_count > 0 || location.schedule_override) {
      menu.push({
        name: 'Schedule',
        url: location.schedule_override ? undefined : '/schedule',
        external: !!location.schedule_override,
        icon: 'clock',
      })
    }
  }

  // Events
  if ((location.location_events_count ?? 0) > 0) {
    menu.push({ name: 'Events', url: '/events', icon: 'calendar' })
  }

  // Blog
  if ((location.blogs?.length ?? 0) > 0) {
    menu.push({ name: 'Blogs', url: '/blog', icon: 'newspaper' })
  }

  // Logged-in only
  if (isLoggedIn) {
    if (organization.require_login_for_virtual_classes) {
      menu.push({ name: 'Agreements', url: '/agreements', icon: 'file-text' })
    }
    if ((location.curriculums?.length ?? 0) > 0) {
      menu.push({ name: 'Curriculum', url: '/curriculum', icon: 'book-open' })
    }
  }

  // Gift card
  if (organization.is_gift_card_enabled) {
    menu.push({ name: 'Gift Card', url: '/gift-card', icon: 'gift' })
  }

  // Contact — only for single-location orgs
  if (locations.length === 1) {
    menu.push({ name: 'Contact Us', url: '/contact', icon: 'phone' })
  }

  // Additional headers from admin
  if ((organization.additional_headers?.length ?? 0) > 0) {
    const siteHosts = new Set(
      [organization.canonical_domain, organization.domain, domain]
        .filter(Boolean)
        .map((h) => (h as string).replace(/^https?:\/\//, '').replace(/\/+$/, '').replace(/^www\./, '')),
    )

    const visibleHeaders = organization.additional_headers.filter(
      (ah) => isLoggedIn || !ah.is_member_only,
    )
    const visibleNames = new Set(visibleHeaders.map((ah) => ah.text))
    const filtered = menu.filter((m) => !visibleNames.has(m.name))

    const extra = visibleHeaders.map((ah) => {
      let link = ah.link
      if (link?.startsWith('http')) {
        try {
          const parsed = new URL(link)
          const host = parsed.hostname.replace(/^www\./, '')
          if (siteHosts.has(host)) link = parsed.pathname + parsed.search + parsed.hash
        } catch {
          /* leave as-is */
        }
      }
      return { name: ah.text, url: link, external: link?.startsWith('http') }
    })

    return [...filtered, ...extra]
  }

  return menu
}
