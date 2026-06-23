'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
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
 * SalonHeader — White background header with:
 * - Left: circle hamburger + logo
 * - Right: Gift Certificate, Book Now CTA, Existing Customers link
 * - Slide-in left sidebar with menu tree
 */
export function SalonHeader({ initialOrganization, initialLocation, initialLocations }: Props) {
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
  const underMaintenance = organization.under_maintenance

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const logoUrl = buildMediaUrl(organization?.primary_logo)
  const callToAction = location.call_to_action || 'Book Now'
  const planOverride = (location as any)?.plan_override ?? ''

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

  function handleCtaClick() {
    if (underMaintenance) return
    setDialog(true)
  }

  const accentColor = (organization as any)?.colors?.['app-darker-background'] || '#333'
  const giftColor = (organization as any)?.colors?.['app-main-accent-with-transparent'] || 'var(--org-primary)'
  const loginColor = (organization as any)?.colors?.['app-main-accent-color'] || 'var(--org-primary)'

  return (
    <>
      <Banner initialOrganization={initialOrganization} />

      <nav
        className={cn(
          'fixed left-0 right-0 z-50 bg-white transition-[top,box-shadow] duration-300',
          showBanner ? 'top-[57px]' : 'top-0',
          scrolled && 'shadow-[3px_1px_11px_rgba(0,0,0,0.14)]',
        )}
        style={{ minHeight: 84 }}
        aria-label="Main navigation"
      >
        <div className="flex h-[84px] items-center justify-between px-0">
          {/* Left: toggle + logo */}
          <div className="flex items-center gap-2 px-2">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-[#272727] text-white hover:bg-[#444] transition-colors flex-shrink-0 mt-[10px]"
              aria-label="Toggle navigation"
            >
              <Menu size={20} />
            </button>

            {logoUrl ? (
              <Link href="/" className="ml-2" aria-label="Home">
                <Image
                  src={logoUrl}
                  alt={`${organization.name} logo`}
                  width={227}
                  height={60}
                  className="h-[60px] w-auto max-w-[227px] object-contain cursor-pointer"
                  priority
                />
              </Link>
            ) : (
              <Link href="/" className="ml-2 text-lg font-bold text-gray-900">
                {organization.name}
              </Link>
            )}
          </div>

          {/* Right: navigation buttons */}
          <div className="hidden sm:flex items-center gap-2 pr-2">
            <Link
              href="/gift-card"
              className="px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: giftColor }}
              aria-label="View gift certificate"
            >
              Gift Certificate
            </Link>

            {!isLoggedIn && (
              <button
                onClick={handleCtaClick}
                className="px-3 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: accentColor }}
                aria-label={callToAction}
              >
                {callToAction}
              </button>
            )}

            {planOverride && (
              <a
                href={`http://${planOverride}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded border px-3 py-1.5 text-sm transition-colors hover:opacity-80"
                style={{ borderColor: loginColor, color: loginColor }}
                aria-label="Existing customers login"
              >
                Existing Customers
              </a>
            )}
          </div>

          {/* Mobile: only book now shown small */}
          <div className="flex sm:hidden items-center pr-2">
            <a
              href={planOverride ? `http://${planOverride}` : '/login'}
              target={planOverride ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded border px-2 py-1 text-xs transition-colors"
              style={{ borderColor: loginColor, color: loginColor }}
              aria-label="Existing customers"
            >
              Existing Customers
            </a>
          </div>
        </div>

        {/* Mobile Book Now */}
        {!isLoggedIn && (
          <div className="px-4 pb-3 sm:hidden">
            <button
              onClick={handleCtaClick}
              className="w-full py-2 text-sm font-medium text-white"
              style={{ backgroundColor: accentColor }}
              aria-label={callToAction}
            >
              {callToAction}
            </button>
          </div>
        )}
      </nav>

      {/* Left sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[80] flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
          <aside
            className="relative z-10 flex flex-col overflow-y-auto bg-white shadow-2xl"
            style={{ width: '20%', minWidth: 240, marginTop: 84 + (showBanner ? 57 : 0) }}
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
        style={{ height: 84 + (showBanner ? 57 : 0) }}
      />
    </>
  )
}
