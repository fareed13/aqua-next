'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, X } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { buildMenuItems } from '@/lib/utils/menuItems'
import { buildMediaUrl } from '@/lib/utils/media'
import { NavMenu } from '@/components/layout/NavMenu'
import { Banner } from '@/components/layout/Banner'
import { cn } from '@/lib/utils'
import type { Organization, Location } from '@/types/api'

interface Props {
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
}

/**
 * HeaderAbbi — semi-transparent dark header with a sidebar drawer.
 * Org colors: blue-indigo theme (#4b5ee9 mobile nav background).
 * Login menu is a hardcoded Cognito login URL in the original Nuxt source.
 */
export function HeaderAbbi({ initialOrganization, initialLocation, initialLocations }: Props) {
  const storeOrg = useOrgStore((s) => s.organization)
  const storeLoc = useOrgStore((s) => s.location)
  const storeLocations = useOrgStore((s) => s.locations)

  const organization = storeOrg ?? initialOrganization
  const location = storeLoc ?? initialLocation
  const locations = storeLocations.length > 0 ? storeLocations : initialLocations

  const userToken = useAuthStore((s) => s.userToken)
  const banner = useUiStore((s) => s.banner)
  const dialog = useUiStore((s) => s.dialog)
  const setDialog = useUiStore((s) => s.setDialog)

  const showBanner = organization.is_banner_enabled && banner && !dialog
  const isLoggedIn = !!userToken
  const enableLogin = organization.enable_login

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const logoUrl = buildMediaUrl(organization?.primary_logo)
  const underMaintenance = organization.under_maintenance

  // Abbi has a static "Login" menu item pointing to Cognito
  const COGNITO_LOGIN_URL =
    'https://abbiuser.auth.us-east-2.amazoncognito.com/login?client_id=5agqvgvq5qdon6v2tel0u0b0sa&response_type=token&scope=aws.cognito.signin.user.admin+openid+profile&redirect_uri=https://crm.abbi.ai'

  const menuItems = useMemo(
    () => buildMenuItems(organization, location, locations, isLoggedIn),
    [organization, location, locations, isLoggedIn],
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  function handleCtaClick() {
    if (underMaintenance) return
    setDialog(true)
  }

  return (
    <>
      <Banner initialOrganization={initialOrganization} />

      <header
        className={cn(
          'fixed left-0 right-0 z-50 transition-[top,box-shadow] duration-300',
          showBanner ? 'top-[57px]' : 'top-0',
          scrolled && 'shadow-lg',
        )}
        style={{ background: 'rgba(0,0,0,0.2)' }}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          {/* Logo centered */}
          <div className="flex flex-1 justify-center md:justify-start">
            {logoUrl ? (
              <Link href="/" aria-label="Home">
                <Image
                  src={logoUrl}
                  alt={`${organization.name} logo`}
                  width={200}
                  height={70}
                  className="mt-[30px] h-[70px] w-auto max-w-[200px] object-contain md:mt-0"
                  priority
                />
              </Link>
            ) : (
              <Link href="/" className="text-lg font-bold text-white">
                {organization.name}
              </Link>
            )}
          </div>

          {/* Right: login + hamburger */}
          <div className="flex items-center gap-3">
            {enableLogin && !isLoggedIn && (
              <a
                href={COGNITO_LOGIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded border px-3 py-1.5 text-sm font-bold uppercase transition-colors"
                style={{ color: '#435fe7', borderColor: '#435fe7', background: '#fff' }}
                aria-label="Log in to your account"
              >
                <User size={15} />
                Login
              </a>
            )}

            <button
              onClick={() => setDrawerOpen((o) => !o)}
              className="flex md:hidden h-8 w-8 flex-col items-center justify-center gap-[5px]"
              aria-label="Toggle navigation menu"
            >
              <span className="block h-[2px] w-[25px] bg-white transition-all" />
              <span className="block h-[2px] w-[25px] bg-white transition-all" />
              <span className="block h-[2px] w-[25px] bg-white transition-all" />
            </button>
          </div>
        </div>

        {/* CTA button — desktop */}
        <div className="hidden md:flex items-center justify-center pb-3">
          <button
            onClick={handleCtaClick}
            className="rounded-full px-5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#435fe7' }}
            aria-label="Secure your spot"
          >
            Secure your spot
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[80] flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <aside
            className="relative z-10 flex h-full w-full flex-col overflow-y-auto pb-24 text-center"
            style={{ background: '#4b5ee9', marginTop: '80px' }}
            aria-label="Mobile navigation menu"
          >
            <NavMenu items={menuItems} onNavigate={() => setDrawerOpen(false)} />
            <div className="mt-4 px-4">
              <button
                onClick={() => { handleCtaClick(); setDrawerOpen(false) }}
                className="rounded-full px-6 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: '#435fe7' }}
                aria-label="Secure your spot"
              >
                Secure your spot
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Spacer */}
      <div
        className="w-full transition-[height] duration-300"
        style={{ height: 80 + (showBanner ? 57 : 0) }}
      />
    </>
  )
}
