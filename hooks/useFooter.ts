'use client'

import { useState, useMemo, useEffect } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from './useAuth'

interface UseFooterProps {
  previewColors?: Record<string, string> | null
  previewFonts?: Record<string, string> | null
  isPreview?: boolean
}

interface FooterLink {
  text: string
  url: string
  show: boolean
}

export function useFooter(props: UseFooterProps = {}) {
  const { previewColors = null, previewFonts = null } = props

  const organization = useOrgStore(s => s.organization)
  const location = useOrgStore(s => s.location)
  const locations = useOrgStore(s => s.locations)
  const domain = useOrgStore(s => s.domain)
  const setDialog = useUiStore(s => s.setDialog)
  const { isLoggedIn } = useAuth()

  const [loading, setLoading] = useState(false)

  const initialLinks = useMemo((): FooterLink[] => {
    const links: FooterLink[] = [
      { text: 'Home', url: '/', show: true },
      { text: 'Programs', url: '/classes', show: true },
      { text: 'Instructors', url: '/instructors', show: true },
      { text: 'Schedule', url: '/schedule', show: true },
      { text: 'Contact', url: '/contact', show: true },
      { text: 'Login', url: '/login', show: true },
    ]

    if (organization?.school_type) {
      links[1].text = organization.school_type
    }

    const staffs = organization?.staffs ?? []
    if (staffs.length === 1) {
      links[2] = {
        text: organization?.industry_type === 'salon' ? 'Stylists' : 'Instructors',
        url: `/instructors/${staffs[0].slug}`,
        show: true,
      }
    }

    if (organization?.industry_type === 'salon') {
      links[1].text = 'Services'
    }

    if (location?.instructor_text_override) {
      links[2].text = location.instructor_text_override
    }

    if ((location?.schedules_count ?? 0) < 1 || organization?.industry_type === 'salon') {
      links[3].show = false
    }

    return links
  }, [organization, location])

  const [mainLinks, setMainLinks] = useState<FooterLink[]>(initialLinks)

  useEffect(() => {
    setMainLinks(prev => {
      const updated = [...prev]
      if (updated[5]) {
        updated[5] = { ...updated[5], show: !isLoggedIn() }
      }
      return updated
    })
  }, [isLoggedIn])

  const schoolType = useMemo(() => {
    return organization?.school_type ?? 'Fitness Classes'
  }, [organization])

  const logo = useMemo(() => {
    if (!organization?.primary_logo?.uuid) return ''
    const l = organization.primary_logo
    const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
    return `${mediaUrl}/${l.uuid}_350.${l.extension}`
  }, [organization])

  const colors = useMemo(() => {
    return previewColors || organization?.colors || {}
  }, [previewColors, organization])

  const fonts = useMemo(() => {
    return previewFonts || organization?.fonts || {}
  }, [previewFonts, organization])

  const fontStyles = useMemo(() => {
    const styles: Record<string, string> = {}
    if (fonts.body) styles['--font-body'] = fonts.body
    if (fonts.h1) styles['--font-h1'] = fonts.h1
    if (fonts.h2) styles['--font-h2'] = fonts.h2
    if (fonts.h3) styles['--font-h3'] = fonts.h3
    if (fonts.h4) styles['--font-h4'] = fonts.h4
    if (fonts.h5) styles['--font-h5'] = fonts.h5
    if (fonts.h6) styles['--font-h6'] = fonts.h6
    if (fonts.p) styles['--font-p'] = fonts.p
    return styles
  }, [fonts])

  const phoneLink = useMemo(() => {
    return `tel:${location?.phone ?? ''}`
  }, [location])

  const secondaryPhoneLink = useMemo(() => {
    return `tel:${location?.secondary_phone ?? ''}`
  }, [location])

  const mailLink = useMemo(() => {
    return `mailto:${location?.email ?? ''}`
  }, [location])

  const trackCallClick = () => {
    try { (window as any).gtag?.('event', 'call_click', {}) } catch {}
    try { (window as any).fbq?.('track', 'call_click') } catch {}
  }

  return {
    organization,
    location,
    locations,
    domain,
    loading,
    setLoading,
    schoolType,
    mainLinks,
    logo,
    colors,
    fonts,
    fontStyles,
    phoneLink,
    secondaryPhoneLink,
    mailLink,
    setDialog,
    trackCallClick,
  }
}
