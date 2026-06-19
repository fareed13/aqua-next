'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { ProgramDefault } from '@/components/programBlocks/ProgramDefault'

export function ServiceClasses() {
  const { isAdminLoggedIn } = useAuth()
  const organization = useOrgStore(s => s.organization)
  const services = useOrgStore(s => s.services)

  const [backgroundImage, setBackgroundImage] = useState('bg_striped_orange.png')

  useEffect(() => {
    const org = organization as any
    if (org?.shared?.inner_page_media?.name) {
      setBackgroundImage(`${org.shared.inner_page_media.name}.${org.shared.inner_page_media.extension}`)
    }
  }, [organization])

  const isAdmin = isAdminLoggedIn()
  const hasMultipleServices = Array.isArray(services) && services.length > 1

  return (
    <div>
      {isAdmin && (
        <div className="flex flex-wrap justify-center gap-4 px-4 py-5">
          {/* ServiceAddEdit — not yet migrated; placeholder */}
          <div className="mx-3 mt-1 text-sm text-gray-400 italic">[Service Add/Edit — coming soon]</div>

          {hasMultipleServices && (
            /* ReorderPrograms — not yet migrated; placeholder */
            <button disabled
              className="mx-3 mt-1 px-4 py-2 bg-[#124e66] text-white rounded opacity-60 cursor-not-allowed text-sm">
              Change Programs Order
            </button>
          )}

          {/* ServiceSettings — not yet migrated; placeholder */}
          <button disabled
            className="mx-3 mt-1 px-4 py-2 bg-[#124e66] text-white rounded opacity-60 cursor-not-allowed text-sm">
            Additional Service Settings
          </button>
        </div>
      )}

      <ProgramDefault backgroundImage={backgroundImage} />
    </div>
  )
}
