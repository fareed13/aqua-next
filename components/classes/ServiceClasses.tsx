'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { ProgramDefault } from '@/components/programBlocks/ProgramDefault'

// Admin-only — keep all three out of the public bundle (see admin-ui lazy pattern).
const ServiceEdit = dynamic(
  () => import('@/components/service/ServiceEdit').then(m => m.ServiceEdit),
  { ssr: false },
)
const ReorderPrograms = dynamic(
  () => import('@/components/programBlocks/ReorderPrograms').then(m => m.ReorderPrograms),
  { ssr: false },
)
const ServiceSettings = dynamic(
  () => import('@/components/programBlocks/admin/ServiceSettings').then(m => m.ServiceSettings),
  { ssr: false },
)

export function ServiceClasses() {
  const { isAdminLoggedIn } = useAuth()
  const organization = useOrgStore(s => s.organization)
  const services = useOrgStore(s => s.organization?.services ?? [])

  const [backgroundImage, setBackgroundImage] = useState('bg_striped_orange.png')

  // Auth lives in client-only storage, so reading it during the first client
  // render disagrees with the server HTML and fails hydration (same bug as the
  // header variants). Gate on `mounted`.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [orderPopup, setOrderPopup] = useState(false)
  const [settingsPopup, setSettingsPopup] = useState(false)

  useEffect(() => {
    const org = organization as any
    if (org?.shared?.inner_page_media?.name) {
      setBackgroundImage(`${org.shared.inner_page_media.name}.${org.shared.inner_page_media.extension}`)
    }
  }, [organization])

  const isAdmin = mounted && isAdminLoggedIn()
  const hasMultipleServices = Array.isArray(services) && services.length > 1

  return (
    <div>
      {isAdmin && (
        <div className="flex flex-wrap justify-center gap-4 px-4 py-5">
          {/* No serviceId → Add mode, matching Nuxt's bare <ServiceAddEdit /> here. */}
          <ServiceEdit />

          {/* Nuxt: v-if="store.getServices && store.getServices.length > 1" */}
          {hasMultipleServices && (
            <button
              type="button"
              onClick={() => setOrderPopup(true)}
              className="px-6 py-3 text-white rounded font-semibold text-sm uppercase tracking-wide"
              style={{ backgroundColor: '#124e66' }}
            >
              Change Programs Order
            </button>
          )}

          <button
            type="button"
            onClick={() => setSettingsPopup(true)}
            className="px-6 py-3 text-white rounded font-semibold text-sm uppercase tracking-wide"
            style={{ backgroundColor: '#124e66' }}
          >
            Additional Service Settings
          </button>
        </div>
      )}

      <ProgramDefault component="ProgramDefault" backgroundImage={backgroundImage} />

      {isAdmin && orderPopup && hasMultipleServices && (
        <ReorderPrograms popup={orderPopup} closePopup={() => setOrderPopup(false)} />
      )}
      {isAdmin && settingsPopup && (
        <ServiceSettings popup={settingsPopup} closePopup={() => setSettingsPopup(false)} />
      )}
    </div>
  )
}
