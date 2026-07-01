'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, User } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useAuthStore } from '@/store/authStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import { buildMenuItems } from '@/lib/utils/menuItems'
import { buildMediaUrl } from '@/lib/utils/media'
import { NavMenu } from '@/components/layout/NavMenu'
import { SocialIcon } from '@/components/layout/SocialIcon'
import { Banner } from '@/components/layout/Banner'
import { cn } from '@/lib/utils'
import type { Organization, Location } from '@/types/api'

interface Props {
  /** Server-fetched data — available on first render before Zustand hydrates */
  initialOrganization: Organization
  initialLocation: Location
  initialLocations: Location[]
}

export function BlackHeader({ initialOrganization, initialLocation, initialLocations }: Props) {
  // Store subscriptions take over after StoreHydrator runs.
  // Fall back to server props for the first render so there is no flash.
  const storeOrg = useOrgStore((s) => s.organization)
  const storeLoc = useOrgStore((s) => s.location)
  const storeLocations = useOrgStore((s) => s.locations)
  const storeDomain = useOrgStore((s) => s.domain)

  const organization = storeOrg ?? initialOrganization
  const location = storeLoc ?? initialLocation
  const locations = storeLocations.length > 0 ? storeLocations : initialLocations

  const userToken = useAuthStore((s) => s.userToken)
  const banner    = useUiStore((s) => s.banner)
  const dialog    = useUiStore((s) => s.dialog)
  const setDialog = useUiStore((s) => s.setDialog)
  const { isMemberLoggedIn, getUser, isLoggedIn: isLoggedInFn, logOut } = useAuth()

  // Mirror the Banner component's visibility logic to offset the header
  const showBanner = organization.is_banner_enabled && banner && !dialog

  const isLoggedIn = isLoggedInFn()
  const memberUser = isMemberLoggedIn() ? getUser() : null
  const avatarLogo = memberUser
    ? `${memberUser.first_name?.[0] ?? ''}${memberUser.last_name?.[0] ?? ''}`.toUpperCase()
    : ''

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const logoUrl = buildMediaUrl(organization?.primary_logo)
  const callToAction = location.call_to_action || 'Secure Your First Class'
  const socialMedia = location.social_media ?? []
  const headerHeight = (socialMedia.length > 0 ? 100 : 72) + (showBanner ? 57 : 0)
  const enableLogin = organization.enable_login
  const underMaintenance = organization.under_maintenance
  const topLevelServices = organization.services?.filter((s) => !s.parent_service) ?? []
  const showClassesLink = topLevelServices.length > 0

  const menuItems = useMemo(
    () => buildMenuItems(organization, location, locations, isLoggedIn, storeDomain),
    [organization, location, locations, isLoggedIn, storeDomain],
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

  function handleCtaClick() {
    if (underMaintenance) return
    setDialog(true)
  }

  return (
    <>
      <Banner initialOrganization={initialOrganization} />
      <header
        className={cn(
          'fixed left-0 right-0 z-50 bg-black transition-[top,box-shadow] duration-300',
          showBanner ? 'top-[57px]' : 'top-0',
          scrolled && 'shadow-lg',
        )}
        aria-label="Main navigation"
      >
        {/* Social icons top bar */}
        {socialMedia.length > 0 && (
          <div className="flex justify-end gap-2 px-6 pt-2">
            {socialMedia.map((sm, i) => (
              <a
                key={i}
                href={sm.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Visit our ${sm.platform} page`}
                className="flex h-6 w-6 items-center justify-center rounded-full bg-[#666] text-white hover:bg-[#888] transition-colors"
              >
                <SocialIcon platform={sm.platform} size={14} />
              </a>
            ))}
          </div>
        )}

        {/* Main nav row */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#272727] text-white hover:bg-[#333] transition-colors"
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
                    className="h-[60px] w-auto object-contain"
                    priority
                  />
                </Link>
              ) : (
                <Link href="/" className="text-lg font-bold text-white">
                  {organization.name}
                </Link>
              )}
            </div>

            {/* Classes nav link — hidden on mobile, matches Nuxt nav-single-link-hide */}
            {showClassesLink && (
              <Link
                href="/classes"
                className="relative hidden pb-1 text-sm font-medium uppercase tracking-widest text-white transition-opacity hover:opacity-80 md:block"
                style={{ borderBottom: '2px solid var(--org-underline, var(--org-primary))' }}
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
                className="hidden sm:block rounded px-4 py-[7px] text-sm font-medium uppercase text-white transition-opacity hover:opacity-90 md:tracking-[1px] lg:text-[11px]"
                style={{ backgroundColor: 'var(--org-primary)' }}
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
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-500 text-white hover:border-gray-300 transition-colors"
                      aria-label="User account menu"
                    >
                      {avatarLogo ? (
                        <span className="text-sm font-bold uppercase leading-none">{avatarLogo}</span>
                      ) : (
                        <User size={18} />
                      )}
                    </button>
                    {userMenuOpen && (
                      <div className="absolute right-0 top-12 z-50 min-w-[140px] rounded bg-white shadow-lg">
                        <Link
                          href="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <button
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          onClick={() => { setUserMenuOpen(false); logOut() }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-1 rounded border px-4 py-1.5 text-sm transition-colors hover:opacity-80 md:text-xs md:h-[39px]"
                    style={{ borderColor: 'var(--org-primary)', color: 'var(--org-primary)' }}
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
              className="w-full rounded py-2 text-sm font-medium uppercase tracking-[1px] text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--org-primary)' }}
            >
              {callToAction}
            </button>
          </div>
        )}
      </header>

      {/* Sidebar — fixed left panel matching Nuxt .left-sidebar, no dark backdrop */}
      {sidebarOpen && (
        <>
          {/* Transparent click-outside catcher */}
          <div
            className="fixed inset-0 z-[39]"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* Panel: white, fixed, starts from top of page, responsive width */}
          <aside
            className="fixed left-0 z-[40] w-full overflow-y-auto bg-white pb-20 md:w-1/2 lg:w-1/3 xl:w-[20%]"
            style={{
              top: 0,
              height: '100vh',
              boxShadow: '0px 6px 9px #cccccc59',
              paddingTop: 10,
            }}
            aria-label="Main navigation menu"
          >
            <NavMenu items={menuItems} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Spacer: header height + banner height when banner is visible */}
      <div
        className="w-full transition-[height] duration-300"
        style={{
          height: (socialMedia.length > 0 ? 100 : 72) + (showBanner ? 57 : 0),
        }}
      />
    </>
  )
}
