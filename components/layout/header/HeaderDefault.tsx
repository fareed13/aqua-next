'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, User, X } from 'lucide-react'
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
 * HeaderDefault — Black top-bar with a left slide-in sidebar (drawer).
 * Matches the Nuxt "DefaultHeader" layout: hamburger + logo + classes link on the left,
 * CTA + login on the right. Sidebar overlays the page from the left.
 */
export function HeaderDefault({ initialOrganization, initialLocation, initialLocations }: Props) {
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
  const underMaintenance = organization.under_maintenance

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const sidebarRef = useRef<HTMLDivElement>(null)

  const logoUrl = buildMediaUrl(organization?.primary_logo)
  const callToAction = location.call_to_action || 'Secure Your First Class'
  const topLevelServices = organization.services?.filter((s) => !s.parent_service) ?? []
  const showClassesLink = topLevelServices.length > 0
  const underlineColor = (organization as any)?.colors?.['main-accent-text-underline'] || '#d5242c'

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
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setSidebarOpen(false)
      }
    }
    if (sidebarOpen) document.body.addEventListener('click', handleClickOutside)
    return () => document.body.removeEventListener('click', handleClickOutside)
  }, [sidebarOpen])

  function handleCtaClick() {
    if (underMaintenance) return
    setDialog(true)
  }

  const accentColor = (organization as any)?.colors?.['app-main-accent-color']
  const ctaBg = accentColor && /^#000|^rgba\(0,\s*0,\s*0,\s*1\)/i.test(accentColor) ? 'gray' : (accentColor || 'gray')
  const loginColor = accentColor && /^#000|^rgba\(0,\s*0,\s*0,\s*1\)/i.test(accentColor) ? 'white' : (accentColor || 'gray')

  return (
    <>
      <Banner initialOrganization={initialOrganization} />

      {/* Top nav bar */}
      <header
        className={cn(
          'fixed left-0 right-0 z-50 bg-black border-b border-[#cccccc8f] transition-[top,box-shadow] duration-300',
          showBanner ? 'top-[57px]' : 'top-0',
          scrolled && 'shadow-lg',
        )}
        style={{ minHeight: 85, maxHeight: 85 }}
        aria-label="Main navigation"
      >
        <div className="flex h-[85px] items-center justify-between px-4 md:px-[17px]">
          {/* Left: toggle + logo + classes */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex h-[45px] w-[45px] items-center justify-center rounded-full bg-[#272727] text-white hover:bg-[#333] transition-colors flex-shrink-0"
              aria-label="Toggle navigation"
            >
              <Menu size={22} />
            </button>

            <div className="mx-[30px]">
              {logoUrl ? (
                <Link href="/" aria-label="Home">
                  <Image
                    src={logoUrl}
                    alt={`${organization.name} logo`}
                    width={200}
                    height={60}
                    className="h-[60px] w-auto max-w-[200px] object-contain cursor-pointer"
                    priority
                  />
                </Link>
              ) : (
                <Link href="/" className="text-lg font-bold text-white">
                  {organization.name}
                </Link>
              )}
            </div>

            {showClassesLink && (
              <Link
                href="/classes"
                className="hidden md:block relative pb-1 text-sm font-medium uppercase text-white transition-opacity hover:opacity-80"
                style={{ borderBottom: `2px solid ${underlineColor}` }}
                aria-label={`View ${organization.school_type ?? 'Fitness Classes'}`}
              >
                {organization.school_type ?? 'Fitness Classes'}
              </Link>
            )}
          </div>

          {/* Right: CTA + login */}
          <div className="flex items-center gap-2">
            {!isLoggedIn && (
              <button
                onClick={handleCtaClick}
                className="hidden sm:block rounded px-4 py-2 text-sm font-medium uppercase text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: ctaBg }}
                aria-label={callToAction}
              >
                {callToAction}
              </button>
            )}

            {enableLogin && (
              <div className="relative">
                {isLoggedIn ? (
                  <>
                    <button
                      onClick={() => setUserMenuOpen((o) => !o)}
                      className="flex h-[45px] w-[45px] items-center justify-center rounded-full border border-gray-500 text-white hover:border-gray-300 transition-colors"
                      aria-label="User account menu"
                    >
                      <User size={18} />
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-12 z-50 min-w-[140px] rounded bg-white shadow-lg">
                        <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Profile</Link>
                        <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Logout</button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1 rounded border px-3 py-1.5 text-sm transition-colors hover:opacity-80"
                    style={{ borderColor: loginColor, color: loginColor }}
                    aria-label="Log in to your account"
                  >
                    <User size={15} />
                    Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile CTA */}
        {!isLoggedIn && (
          <div className="px-4 pb-3 sm:hidden">
            <button
              onClick={handleCtaClick}
              className="w-full rounded py-2 text-sm font-medium uppercase text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ctaBg }}
            >
              {callToAction}
            </button>
          </div>
        )}
      </header>

      {/* Left sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[80] flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <aside
            ref={sidebarRef}
            className="relative z-10 flex h-full w-4/5 max-w-[20%] md:w-[20%] flex-col overflow-y-auto bg-white shadow-2xl"
            style={{ marginTop: 85 }}
            aria-label="Main navigation menu"
          >
            <div className="flex items-center justify-between border-b px-4 py-3">
              <span className="text-sm font-semibold text-gray-700">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="rounded p-1 text-gray-500 hover:text-gray-800" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 py-2">
              <NavMenu items={menuItems} onNavigate={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Spacer */}
      <div
        className="w-full transition-[height] duration-300"
        style={{ height: 85 + (showBanner ? 57 : 0) }}
      />
    </>
  )
}
