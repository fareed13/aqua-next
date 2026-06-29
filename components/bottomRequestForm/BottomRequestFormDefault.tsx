'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? 'https://d3k0lk57n8zw9s.cloudfront.net'
const FAB_OPEN_IMAGE = `${MEDIA_URL}/open-img.png`

function getCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

export function BottomRequestFormDefault() {
  const pathname = usePathname()
  const accentColor = useOrgStore(s => s.organization?.colors?.['app-main-accent-color']) ?? '#D5242C'
  const dialog = useUiStore(s => s.dialog)
  const setDialog = useUiStore(s => s.setDialog)

  const [isMobile, setIsMobile] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 800px)').matches)
    setIsLoggedIn(!!getCookie('auth._token.local'))
  }, [])

  // Hide on checkout page or when user is logged in
  if (isLoggedIn || pathname.includes('/checkout')) return null
  // Hide when the dialog is already open
  if (dialog) return null

  const openForm = () => {
    setDialog(true)
    try {
      // @ts-expect-error — gtag is a global injected by AnalyticsScripts
      gtag('event', 'secure_your_class_clicked', { button: 'floating_action_button' })
    } catch {
      // gtag not available
    }
  }

  return (
    <button
      className="bottom_request_form_btn"
      style={{
        position: 'fixed',
        bottom: 30,
        right: 30,
        background: accentColor,
        border: '5px solid #ffffff',
        borderRadius: '50%',
        height: 80,
        width: 80,
        minHeight: 80,
        zIndex: 100,
        padding: 10,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseEnter={isMobile ? undefined : openForm}
      onClick={openForm}
      aria-label="Open lead form"
    >
      <Image
        src={FAB_OPEN_IMAGE}
        alt="Open lead form button"
        width={50}
        height={50}
        style={{ objectFit: 'contain' }}
        priority
      />
    </button>
  )
}
