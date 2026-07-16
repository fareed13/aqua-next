'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { CustomerDetails } from './CustomerDetails'
import { CustomerBelts } from './CustomerBelts'
import { CustomerAgreements } from './CustomerAgreements'
import { CustomerNotes } from './CustomerNotes'
import { CustomerClasses } from './CustomerClasses'
import { CustomerAttendance } from './CustomerAttendance'
import { CustomerPurchases } from './CustomerPurchases'
import { CustomerEmergencyContacts } from './CustomerEmergencyContacts'
import { CustomerCommunication } from './CustomerCommunication'

interface CustomerAddEditProps {
  contactId?: string
  spam?: string | null
}

// Order + labels mirror Nuxt CustomerAddEdit.vue's <v-tab>s. Every tab except
// "details" is gated on an existing contact (Nuxt: v-if="contactId").
const TABS: Array<{ value: string; label: string }> = [
  { value: 'details', label: 'Details' },
  { value: 'belts', label: 'Belts' },
  { value: 'agreements', label: 'Agreements' },
  { value: 'notes', label: 'Notes' },
  { value: 'classes', label: 'classes' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'purchases', label: 'Purchases' },
  { value: 'emergencyContacts', label: 'Emergency Contacts' },
  { value: 'communication', label: 'Communications' },
]

export function CustomerAddEdit({ contactId, spam }: CustomerAddEditProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAdminLoggedIn } = useAuth()
  const { getSecure } = useSecureCalls()

  const [overlay, setOverlay] = useState(false)
  const [tab, setTab] = useState('details')
  const [contact, setContact] = useState<any>(null)
  const [allContacts, setAllContacts] = useState<any[]>([])

  // 'new' is the create route; any other slug is an existing contact id.
  const isNew = !contactId || contactId === 'new'

  const load = useCallback(async () => {
    setOverlay(true)
    try {
      // Full contact list for the related-contact / emergency-contact pickers
      // (Nuxt: store.allContacts, backed by GET /customer/lite/).
      getSecure<any[]>(SECURE_ENDPOINTS.CUSTOMER_LITE)
        .then(res => setAllContacts(Array.isArray(res) ? res : []))
        .catch(() => setAllContacts([]))

      if (!isNew) {
        const response = await getSecure<{ results: any[] }>(SECURE_ENDPOINTS.CUSTOMER, {
          id: contactId as string,
          // Nuxt forwards the ?spam flag so spam records resolve on the detail fetch.
          ...(spam != null ? { spam } : {}),
        })
        const data = (response as any)?.results
        setContact(Array.isArray(data) && data.length ? data[0] : null)

        // Nuxt: ?communication=1 deep-links straight to the Communications tab.
        if (searchParams.get('communication') === '1') setTab('communication')
      }
    } catch (error) {
      console.error(error)
    } finally {
      setOverlay(false)
    }
  }, [contactId, isNew, spam, getSecure, searchParams])

  useEffect(() => {
    // Auth reads document.cookie (client-only); safe here because effects run
    // only on the client, so this never diverges from the server render.
    if (!isAdminLoggedIn()) { router.push('/'); return }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const visibleTabs = isNew ? TABS.filter(t => t.value === 'details') : TABS

  const renderTab = () => {
    switch (tab) {
      case 'details':
        return <CustomerDetails contact={contact} allContacts={allContacts} />
      case 'belts':
        return <CustomerBelts contact={contact} />
      case 'agreements':
        return <CustomerAgreements contact={contact} />
      case 'notes':
        return <CustomerNotes contact={contact} />
      case 'classes':
        return <CustomerClasses contact={contact} />
      case 'attendance':
        return <CustomerAttendance contact={contact} />
      case 'purchases':
        return <CustomerPurchases contact={contact} />
      case 'emergencyContacts':
        return <CustomerEmergencyContacts contact={contact} allContacts={allContacts} />
      case 'communication':
        return <CustomerCommunication contact={contact} allContacts={allContacts} />
      default:
        return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 relative">
      {overlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60">
          <div className="w-16 h-16 border-4 border-[#124e66] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="bg-white border rounded shadow-sm">
        {/* Tab bar — only shown for an existing contact, matching Nuxt */}
        {!isNew && (
          <div className="bg-black p-5 pb-0">
            <div className="flex gap-1 overflow-x-auto">
              {visibleTabs.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTab(t.value)}
                  className={`px-4 py-2 min-w-[140px] whitespace-nowrap text-sm font-medium rounded-t transition-colors ${
                    tab === t.value
                      ? 'bg-white text-[#124e66]'
                      : 'bg-[#666666] text-white hover:bg-[#555]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-2 md:p-4">{renderTab()}</div>
      </div>
    </div>
  )
}
