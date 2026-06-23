'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown, X } from 'lucide-react'
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

export function Header360({ initialOrganization, initialLocation, initialLocations }: Props) {
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

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const logoUrl = buildMediaUrl(organization?.primary_logo)
  const callToAction = location.call_to_action || 'Get Started Today'
  const underMaintenance = organization.under_maintenance

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

      {/* Black fixed header */}
      <header
        className={cn(
          'fixed left-0 right-0 z-50 bg-black transition-[top,box-shadow] duration-300',
          showBanner ? 'top-[57px]' : 'top-0',
          scrolled && 'shadow-lg',
        )}
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between px-4 py-2 md:px-6">
          {/* Logo */}
          <div>
            {logoUrl ? (
              <Link href="/" aria-label="Home">
                <Image
                  src={logoUrl}
                  alt={`${organization.name} logo`}
                  width={200}
                  height={60}
                  className="h-[60px] w-auto max-w-[200px] object-contain"
                  priority
                />
              </Link>
            ) : (
              <Link href="/" className="text-lg font-bold text-white">
                {organization.name}
              </Link>
            )}
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item, i) => {
              const hasChildren = (item.children?.length ?? 0) > 0
              return (
                <div key={i} className="relative group">
                  <Link
                    href={item.url ?? '#'}
                    className="flex items-center gap-1 px-3 py-2 text-sm font-medium uppercase text-white transition-colors hover:opacity-80"
                  >
                    {item.name}
                    {hasChildren && <ChevronDown size={14} />}
                  </Link>
                  {hasChildren && (
                    <div className="absolute left-0 top-full z-50 hidden min-w-[160px] rounded bg-black py-1 shadow-lg group-hover:block">
                      {item.children!.map((child, j) => (
                        <Link
                          key={j}
                          href={child.url ?? '#'}
                          className="block px-4 py-1.5 text-sm uppercase text-white hover:bg-gray-800"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* CTA — accent yellow background like Nuxt source */}
            {!isLoggedIn && (
              <button
                onClick={handleCtaClick}
                className="ml-4 rounded-full px-5 py-1.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
                style={{ backgroundColor: (organization as any)?.colors?.['app-main-accent-color'] || '#f4ca59' }}
                aria-label="Get started today"
              >
                {callToAction}
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen((o) => !o)}
            className="flex md:hidden h-8 w-8 flex-col items-center justify-center gap-[5px]"
            aria-label="Toggle navigation menu"
          >
            {drawerOpen ? (
              <X size={20} className="text-white" />
            ) : (
              <>
                <span className="block h-[2px] w-[25px] bg-white transition-all" />
                <span className="block h-[2px] w-[25px] bg-white transition-all" />
                <span className="block h-[2px] w-[25px] bg-white transition-all" />
              </>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[80] flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <aside className="relative z-10 flex h-full w-4/5 max-w-xs flex-col overflow-y-auto bg-black shadow-2xl" aria-label="Mobile navigation menu">
            <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
              <span className="text-sm font-semibold text-white">Menu</span>
              <button onClick={() => setDrawerOpen(false)} className="rounded p-1 text-gray-400 hover:text-white" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 py-2">
              <NavMenu items={menuItems} onNavigate={() => setDrawerOpen(false)} />
            </div>
            {!isLoggedIn && (
              <div className="p-4">
                <button
                  onClick={() => { handleCtaClick(); setDrawerOpen(false) }}
                  className="w-full rounded-full py-2 text-sm font-medium text-black"
                  style={{ backgroundColor: (organization as any)?.colors?.['app-main-accent-color'] || '#f4ca59' }}
                  aria-label="Secure your spot"
                >
                  Secure your spot
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* Spacer */}
      <div
        className="w-full transition-[height] duration-300"
        style={{ height: 64 + (showBanner ? 57 : 0) }}
      />
    </>
  )
}
