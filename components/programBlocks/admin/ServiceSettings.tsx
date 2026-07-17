'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Props {
  popup: boolean
  closePopup: () => void
}

interface OrgSettings {
  school_type?: string
  class_reservation?: boolean
  require_login_for_virtual_classes?: boolean
}

// Verbatim from Nuxt ServiceSettings.vue (text === value for every entry).
const SCHOOL_TYPES = [
  'Fitness Classes',
  'Self Defense Classes',
  'Programs',
  'Martial Arts Classes',
  'Programmes',
  'Services',
  'Yoga Classes',
]

/**
 * "Additional Service Settings" dialog — ports Nuxt
 * components/programBlocks/admin/ServiceSettings.vue.
 *
 * Despite the name these are ORGANIZATION fields, not service fields: it GETs
 * /organization/ and PUTs the three flags back to the same endpoint.
 */
export function ServiceSettings({ popup, closePopup }: Props) {
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const { getSecure, putSecure } = useSecureCalls()

  const [loading, setLoading] = useState(false)
  const [schoolType, setSchoolType] = useState('')
  const [classReservation, setClassReservation] = useState(false)
  const [requireLogin, setRequireLogin] = useState(false)

  useEffect(() => {
    if (!popup) return
    let cancelled = false

    ;(async () => {
      setLoading(true)
      try {
        const resp = await getSecure<OrgSettings[]>(SECURE_ENDPOINTS.ORGANIZATION)
        const o = resp?.[0]
        if (cancelled || !o) return
        setSchoolType(o.school_type ?? '')
        setClassReservation(!!o.class_reservation)
        setRequireLogin(!!o.require_login_for_virtual_classes)
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => { cancelled = true }
  }, [popup, getSecure])

  if (!popup) return null

  const submit = async () => {
    // Nuxt validates school_type as the only required field.
    if (!schoolType) {
      toast.error('Please fill out the required fields', { duration: 15000 })
      return
    }
    try {
      await putSecure(SECURE_ENDPOINTS.ORGANIZATION, {
        id: organization?.id,
        school_type: schoolType,
        require_login_for_virtual_classes: requireLogin,
        class_reservation: classReservation,
      })
      closePopup()
      // Nuxt resets the fields after a successful save.
      setSchoolType('')
      setClassReservation(false)
      setRequireLogin(false)
      toast.success('Updated successfully', { duration: 15000 })
      router.refresh()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Additional Service Settings</h2>
          <button type="button" onClick={closePopup} aria-label="Close" className="text-2xl leading-none text-gray-500">
            ×
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="py-10 flex justify-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select school type *
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  value={schoolType}
                  onChange={e => setSchoolType(e.target.value)}
                >
                  <option value="">Select school type</option>
                  {SCHOOL_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-green-600"
                  checked={requireLogin}
                  onChange={e => setRequireLogin(e.target.checked)}
                />
                <span className="text-sm text-gray-800">Require Login for Virtual Classes</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-green-600"
                  checked={classReservation}
                  onChange={e => setClassReservation(e.target.checked)}
                />
                <span className="text-sm text-gray-800">Class Reservation</span>
              </label>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            type="button"
            onClick={submit}
            className="w-full bg-green-600 text-white px-6 py-2 rounded font-semibold text-sm uppercase"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
