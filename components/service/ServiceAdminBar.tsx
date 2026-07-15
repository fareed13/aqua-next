'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { ServiceEdit } from '@/components/service/ServiceEdit'
import type { Service } from '@/types/api'

interface Props {
  service: Service
}

/**
 * Admin row on the service (classes/[slug]) page — ports the `v-if="isAdminLoggedIn()"`
 * block in Nuxt pages/classes/[slug]/index.vue.
 *
 * Reorder/Delete Sections is deliberately NOT here: EditableSections already owns it
 * (`showReorder`), shared with the location and page routes. This component holds only
 * the service-specific actions.
 */
export function ServiceAdminBar({ service }: Props) {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure, deleteSecure } = useSecureCalls()

  const [deletePopup, setDeletePopup] = useState(false)
  const [loading, setLoading] = useState(false)

  // Caller gates on `mounted`; this is the admin-role half of Nuxt's isAdminLoggedIn().
  if (!isAdminLoggedIn()) return null

  const deleteService = async () => {
    setLoading(true)
    try {
      // Nuxt's AdminDeleteService re-fetches first and bails if the service is
      // already gone, rather than firing a DELETE that would 404.
      const existing = await getSecure<unknown[]>(SECURE_ENDPOINTS.GET_SERVICES, { id: service.id })
      if (!Array.isArray(existing) || !existing[0]) {
        toast.error(
          'This service is already deleted, changes will show in next few minutes',
          { duration: 15000 },
        )
        setLoading(false)
        setDeletePopup(false)
        return
      }

      await deleteSecure(SECURE_ENDPOINTS.GET_SERVICES, service.id)
      toast.success('Service deleted Successfully', { duration: 5000 })
      setDeletePopup(false)
      // Nuxt does reloadNuxtApp({ path: '/' }) — a full reload so the deleted
      // service drops out of the cached org payload that feeds the nav.
      router.push('/')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete service', { duration: 10000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-wrap justify-center items-center gap-3 pt-5">
      <ServiceEdit serviceId={service.id} />

      <button
        type="button"
        onClick={() => setDeletePopup(true)}
        className="bg-red-600 text-white px-6 py-3 rounded font-semibold text-sm uppercase tracking-wide"
      >
        Delete Service
      </button>

      <DeleteWarning
        popup={deletePopup}
        onConfirm={deleteService}
        onCancel={() => setDeletePopup(false)}
        loading={loading}
        message="Do You Really want to delete this service?"
      />
    </div>
  )
}
