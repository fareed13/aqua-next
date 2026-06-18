/**
 * metaTags.ts — mirrors Nuxt's MetaTags.js (tagsData + headData)
 *
 * Usage in any page's generateMetadata():
 *
 *   import { buildPageMetadata } from '@/lib/utils/metaTags'
 *
 *   export async function generateMetadata() {
 *     const domain = getDomain()
 *     const data  = await fetchOrganization(domain)
 *     const org   = data[0]
 *     return buildPageMetadata({ org, domain, pageName: 'homepage' })
 *   }
 *
 *   // Class page (app/classes/[slug]/page.tsx):
 *   return buildPageMetadata({ org, domain, pageName: 'classes-slug', pageSlug: params.slug })
 *
 *   // Location page (app/locations/[slug]/page.tsx):
 *   return buildPageMetadata({ org, domain, pageName: 'locations-slug', pageSlug: params.slug, locationId: loc.id })
 */

import type { Metadata } from 'next'
import type { Organization, Location, Service } from '@/types/api'

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
const MEDIA_URL   = process.env.NEXT_PUBLIC_MEDIA_URL ?? 'https://d3k0lk57n8zw9s.cloudfront.net'

// ─── helpers ────────────────────────────────────────────────────────────────

function logoUrl(org: Organization): string {
  const l = org.primary_logo
  if (!l?.uuid) return ''
  return `${MEDIA_URL}/${l.uuid}_350.${l.extension}`
}

function canonicalUrl(org: Organization, domain: string, path = ''): string {
  const host = (org.canonical_domain || domain)
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '')
  return `https://${host}${path && path !== '/' ? path : ''}`
}

function arrangeUnitOfTime(amount: number, unit: string): string {
  const map: Record<string, string> = { Class: 'Classes', Week: 'Weeks', Month: 'Months', Day: 'Days' }
  return amount > 1 && map[unit] ? map[unit] : unit
}

function currencyCode(sign: string): string {
  return ({ '$': 'USD', '£': 'GBP', '€': 'EUR', '¥': 'JPY', 'A$': 'AUD', 'C$': 'CAD' } as Record<string, string>)[sign] ?? 'USD'
}

function priceRangeFromServices(services: Service[], currSign: string): string {
  let min: number | null = null, max: number | null = null
  let minAll: number | null = null, maxAll: number | null = null
  services.forEach(svc =>
    svc.service_plans?.forEach(sp => {
      const p = sp.plan
      const price = p.discounted_price != null && p.discounted_price !== ''
        ? parseFloat(p.discounted_price) : parseFloat(p.price)
      if (isNaN(price) || price < 0) return
      if (minAll === null || price < minAll) minAll = price
      if (maxAll === null || price > maxAll) maxAll = price
      if (price > 0) {
        if (min === null || price < min) min = price
        if (max === null || price > max) max = price
      }
    })
  )
  const s = currSign
  if (min !== null && max !== null) return min === max ? `${s}${min}` : `${s}${min} - ${s}${max}`
  if (minAll !== null && maxAll !== null) {
    if (minAll === 0 && maxAll === 0) return 'Free'
    return minAll === maxAll ? `${s}${minAll}` : `${s}${minAll} - ${s}${maxAll}`
  }
  return ''
}

// ─── /website/metatags/ API (Nuxt: tagsData) ────────────────────────────────

interface RawMeta { title: string; description: string; headline: string }

async function fetchRawMeta(
  orgId: number,
  pageName: string,
  pageSlug = '',
  locationId: number | string = '',
): Promise<RawMeta> {
  const params = new URLSearchParams({
    organization_id: String(orgId),
    page_name:        pageName,
    page_slug:        pageSlug,
    location_id:      String(locationId),
  })
  try {
    const res = await fetch(`${BACKEND_URL}/website/metatags/?${params}`, { cache: 'force-cache' })
    if (!res.ok) return { title: '', description: '', headline: '' }
    return res.json()
  } catch {
    return { title: '', description: '', headline: '' }
  }
}

// ─── JSON-LD schemas (Nuxt: indexSchemaJson, faqSchemaJson, productSchemaJson) ──

export function buildLocalBusinessSchema(org: Organization, location: Location, domain: string) {
  const currSign = org.currency_sign ?? '$'
  let type = org.industry_type ?? 'LocalBusiness'
  if (type === 'fitness_center') type = 'HealthClub'
  else if (type === 'salon') type = 'BeautySalon'

  return {
    '@context': 'https://schema.org',
    '@type': [type, 'LocalBusiness'],
    name: org.name,
    logo: logoUrl(org),
    image: logoUrl(org),
    telephone: location.phone || '',
    openingHours: location.hours_of_operation,
    priceRange: priceRangeFromServices(org.services ?? [], currSign),
    url: canonicalUrl(org, domain),
    address: {
      '@type': 'PostalAddress',
      streetAddress: [location.street, location.city, location.state?.name, location.zip_code].filter(Boolean).join(', '),
      addressLocality: location.city,
      addressRegion: location.state?.name,
      postalCode: location.zip_code || '',
      addressCountry: location.target_locations?.[0] || '',
    },
    geo: { '@type': 'GeoCoordinates', latitude: location.latitude, longitude: location.longitude },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: location.phone ? `+1-${location.phone}` : '',
      contactType: 'Customer service',
    },
  }
}

export function buildFaqSchema(org: Organization) {
  const services = org.services ?? []
  const staffNames = (org.staffs ?? []).map(s => s.name).join(', ')
  const currSign = org.currency_sign ?? '$'
  const withPlans = services.filter(s => !s.parent_service && s.service_plans?.length > 0)
  const firstPlan = withPlans[0]?.service_plans[0]?.plan
  const trialDuration = firstPlan
    ? `${firstPlan.amount_of_units} ${arrangeUnitOfTime(firstPlan.amount_of_units, firstPlan.unit_of_time)}`
    : ''
  const trialFee = firstPlan
    ? (firstPlan.discounted_price != null ? firstPlan.discounted_price : firstPlan.price)
    : ''
  const planSummary = withPlans.slice(0, 2).map(s => {
    const p = s.service_plans[0]?.plan
    const price = p ? (p.discounted_price != null ? p.discounted_price : p.price) : '0'
    return `${s.name} (Price: ${currSign}${price})`
  }).join(', ')
  const trainingKeywords = ['private lessons', 'training programs', 'private lesson', 'training program', 'personal training']
  const hasTraining = services.some(s => trainingKeywords.includes(s.name.toLowerCase()))

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What martial arts programs do you offer?',
        acceptedAnswer: { '@type': 'Answer', text: `We offer a variety of martial arts programs including ${services.map(s => s.name).join(', ')}` },
      },
      {
        '@type': 'Question',
        name: 'Who are your instructors?',
        acceptedAnswer: { '@type': 'Answer', text: `Our instructors are certified professionals with years of teaching and competitive ${staffNames} experience.` },
      },
      {
        '@type': 'Question',
        name: 'What is the trial fee at your gym?',
        acceptedAnswer: { '@type': 'Answer', text: `Our ${trialDuration} has trial fee of ${currSign}${trialFee}, ${planSummary}` },
      },
      ...(hasTraining ? [{
        '@type': 'Question',
        name: 'Do you offer personal training?',
        acceptedAnswer: { '@type': 'Answer', text: 'Yes, we do offer personal training.' },
      }] : []),
    ],
  }
}

export function buildProductSchemas(org: Organization, domain: string, filterSlug?: string) {
  const currSign = org.currency_sign ?? '$'
  const currency = currencyCode(currSign)
  const defaultLogo = logoUrl(org)
  const canonicalHost = (org.canonical_domain || domain).replace(/^https?:\/\//, '').replace(/\/+$/, '')
  const nextYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]
  const services = (org.services ?? []).filter(s => !filterSlug || s.slug === filterSlug)
  const products: object[] = []

  function svcImage(svc: Service): string {
    if ((svc as any).image_url) return (svc as any).image_url
    if (svc.large_media?.uuid) return `${MEDIA_URL}/${svc.large_media.uuid}_350.${svc.large_media.extension}`
    return defaultLogo
  }

  services.forEach(svc => {
    if (!svc.name) return
    const slug = svc.slug || svc.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '')
    const offerUrl = `https://${canonicalHost}/classes/${slug}`
    const image = svcImage(svc)
    const base = {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: svc.name,
      description: svc.short_description || `${svc.name} at ${org.name}`,
      image,
    }

    if (svc.service_plans?.length) {
      svc.service_plans.forEach(sp => {
        const p = sp.plan
        const price = p.discounted_price != null && p.discounted_price !== ''
          ? parseFloat(p.discounted_price) : parseFloat(p.price)
        if (isNaN(price) || price < 0) return
        products.push({ ...base, offers: { '@type': 'Offer', price: price.toFixed(2), priceCurrency: currency, availability: 'https://schema.org/InStock', url: offerUrl, priceValidUntil: nextYear } })
      })
    } else {
      products.push({ ...base, offers: { '@type': 'Offer', price: '0.00', priceCurrency: currency, availability: 'https://schema.org/InStock', url: offerUrl, priceValidUntil: nextYear } })
    }
  })

  return products
}

// ─── Main export: buildPageMetadata (Nuxt: headData + tagsData combined) ────

export interface PageMetaOptions {
  org: Organization
  location?: Location
  domain: string
  /** Nuxt route name — e.g. 'homepage', 'classes-slug', 'locations-slug' */
  pageName: string
  /** currentRoute.params.slug */
  pageSlug?: string
  /** resolved location id for multi-location pages */
  locationId?: number | string
  /** canonical path for og:url — defaults to '' (root) */
  path?: string
  /** for class pages: only emit Product schema for this slug */
  serviceSlug?: string
}

export async function buildPageMetadata(opts: PageMetaOptions): Promise<Metadata> {
  const { org, domain, pageName, pageSlug = '', locationId = '', path = '' } = opts

  // Fetch per-page title/description from backend (Nuxt: tagsData)
  const meta = await fetchRawMeta(org.id, pageName, pageSlug, locationId)

  const title       = meta.title       || 'ABBI.AI'
  const description = meta.description || 'Powered by ABBI.AI'
  const logo  = logoUrl(org)
  const url   = canonicalUrl(org, domain, path)

  return {
    title,
    description,
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      title,
      description,
      siteName: org.name,
      url,
      images: logo ? [{ url: logo }] : [],
    },
    twitter: { title, description, images: logo ? [logo] : [] },
    alternates: { canonical: url },
    icons: logo ? { icon: logo, shortcut: logo } : undefined,
  }
}
