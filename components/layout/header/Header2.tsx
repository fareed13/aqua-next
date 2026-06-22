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

export function Header2({ initialOrganization, initialLocation, initialLocations }: Props) {
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
  const [openMenuIdx, setOpenMenuIdx] = useState<number | null>(null)

  const logoUrl = buildMediaUrl(organization?.primary_logo)
  const callToAction = location.call_to_action || 'Get Started Now'
  const underMaintenance = organization.under_maintenance

  const menuItems = useMemo(
    () => buildMenuItems(organization, location, locations, isLoggedIn),
    [organization, location, locations, isLoggedIn],
  )

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

      {/* semi-transparent fixed nav — same aesthetic as Nuxt version (rgba black bg) */}
      <nav
        className={cn(
          'fixed left-0 right-0 top-0 z-[100] mb-5 transition-[top] duration-300',
          showBanner ? 'top-[57px]' : 'top-0',
        )}
        style={{ background: 'rgba(0,0,0,0.85)' }}
        aria-label="Main navigation"
      >
        {/* Logo row */}
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <div className="flex flex-1 justify-center">
            {logoUrl ? (
              <Link href="/" aria-label="Home">
                <Image
                  src={logoUrl}
                  alt={`${organization.name} logo`}
                  width={200}
                  height={70}
                  className="h-[70px] w-auto max-w-[200px] object-contain"
                  priority
                />
              </Link>
            ) : (
              <Link href="/" className="text-lg font-bold text-white">
                {organization.name}
              </Link>
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

        {/* Desktop nav items */}
        <div className="hidden md:flex items-center justify-center gap-2 px-4 pb-3">
          {menuItems.map((item, i) => {
            const hasChildren = (item.children?.length ?? 0) > 0
            return (
              <div key={i} className="relative group">
                <Link
                  href={item.url ?? '#'}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium uppercase text-white transition-colors hover:text-red-400"
                  onClick={() => setOpenMenuIdx(openMenuIdx === i ? null : i)}
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

          {/* CTA */}
          {!isLoggedIn && (
            <button
              onClick={handleCtaClick}
              className="ml-4 rounded-full px-5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--org-primary)' }}
              aria-label="Get started now"
            >
              {callToAction}
            </button>
          )}
        </div>
      </nav>

      {/* Drawer for mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[90] flex flex-col">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <aside
            className="relative z-10 mt-[80px] flex h-full w-full flex-col overflow-y-auto bg-black pb-24 text-center"
            style={{ background: 'rgba(0,0,0,0.95)' }}
            aria-label="Mobile navigation menu"
          >
            <NavMenu items={menuItems} onNavigate={() => setDrawerOpen(false)} />
            <div className="mt-4 px-4">
              <button
                onClick={() => { handleCtaClick(); setDrawerOpen(false) }}
                className="rounded-full px-6 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--org-primary)' }}
                aria-label="Get started now"
              >
                {callToAction}
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Spacer */}
      <div
        className="w-full transition-[height] duration-300"
        style={{ height: (showBanner ? 57 : 0) + 135 }}
      />
    </>
  )
}
