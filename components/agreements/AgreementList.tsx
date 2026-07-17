'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { FileText, Calendar, BadgeCheck } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { diffInYears } from '@/lib/utils/dateTime'
import { MobileCard } from '@/components/customers/MobileCard'
import { SignAgreement } from '@/components/customers/SignAgreement'

interface Agreement {
  id: number
  contact: { first_name: string; last_name: string; birthday?: string }
  agreement: { name: string; content: string }
  status: string | null
  updated_at: string
  pdf_uuid?: string
}

const PER_PAGE = 20

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const yyyy = d.getFullYear()
    const hh = String(d.getHours() % 12 || 12).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    const ampm = d.getHours() >= 12 ? 'PM' : 'AM'
    return `${yyyy}-${mm}-${dd} - (${hh}:${min} ${ampm})`
  } catch {
    return dateStr
  }
}

export function AgreementList() {
  const organization = useOrgStore((s) => s.organization)
  const location = useOrgStore((s) => s.location)
  const domain = useOrgStore((s) => s.domain)
  const router = useRouter()
  const { getUser, isMemberLoggedIn } = useAuth()
  const { getSecure, postSecureBuffer } = useSecureCalls()

  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Sign dialog
  const [signContent, setSignContent] = useState<string | null>(null)
  const [signId, setSignId] = useState<number | null>(null)

  // Member gating — mirrors Nuxt pages/agreements/index.vue: non-user → login,
  // non-member → toast + home.
  useEffect(() => {
    const user = getUser()
    if (!user) {
      router.push('/login?redirect=/agreements')
      return
    }
    if (!isMemberLoggedIn()) {
      toast.error('Please logout and login as a member to see agreements page', { duration: 15000 })
      router.push('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const user = getUser()
    if (!user || !isMemberLoggedIn()) return
    ;(async () => {
      try {
        // Nuxt fetches the member's OWN agreements by contact id (not org id).
        const data = await getSecure<Agreement[]>(SECURE_ENDPOINTS.CUSTOMER_AGREEMENTS, { contact: user.id })
        setAgreements(Array.isArray(data) ? data : [])
      } catch {
        console.error('Error loading agreements')
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages = Math.max(1, Math.ceil(agreements.length / PER_PAGE))
  const pageItems = useMemo(
    () => agreements.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [agreements, page]
  )

  // Nuxt openAgreement: signed → download the PDF in a new tab; otherwise → substitute
  // the reserved keywords into the content and open the signing dialog.
  const openAgreement = async (item: Agreement) => {
    if (item.status === 'signed') {
      try {
        const buf = await postSecureBuffer<ArrayBuffer>(SECURE_ENDPOINTS.DOWNLOAD_AGREEMENT, {
          file_name: `${item.pdf_uuid}.pdf`,
        })
        const url = URL.createObjectURL(new Blob([buf], { type: 'application/pdf' }))
        window.open(url, '_blank')
      } catch (e) {
        console.error(e)
      }
      return
    }

    const locationDomain = ((organization as any)?.canonical_domain || domain || '')
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
    const now = new Date()
    const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}/${now.getFullYear()}`

    const content = (item.agreement.content ?? '')
      .replace(/#customerFirstName#/g, item.contact.first_name ?? '')
      .replace(/#customerLastName#/g, item.contact.last_name ?? '')
      .replace(/#organizationName#/g, organization?.name ?? '')
      .replace(/#locationDomain#/g, locationDomain)
      .replace(/#street#/g, (location as any)?.street ?? '')
      .replace(/#age#/g, item.contact.birthday ? String(diffInYears(new Date(), item.contact.birthday)) : '')
      .replace(/#currentDate#/g, currentDate)

    setSignContent(content)
    setSignId(item.id)
  }

  // After a successful sign: drop the old row and unshift the updated one, close dialog.
  const onAgreementUpdated = (updated: unknown) => {
    const rec = updated as Agreement
    setAgreements((prev) => [rec, ...prev.filter((a) => a.id !== rec.id)])
    setSignContent(null)
    setSignId(null)
  }

  if (loading) {
    return (
      <div className="bg-[#f3f3f3] py-10 text-center">
        <p className="text-gray-500">Loading agreements...</p>
      </div>
    )
  }

  if (!agreements.length) {
    return (
      <div className="bg-[#f3f3f3] py-10 text-center">
        <p className="text-gray-500">No agreements found.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#f3f3f3] py-6">
      <div className="max-w-5xl mx-auto px-4">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full bg-white shadow rounded text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold">Contact Name</th>
                <th className="text-left px-4 py-3 font-semibold">Name</th>
                <th className="text-left px-4 py-3 font-semibold">Last Updated</th>
                <th className="text-left px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((ag) => (
                <tr
                  key={ag.id}
                  onClick={() => openAgreement(ag)}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-3">{ag.contact.first_name} {ag.contact.last_name}</td>
                  <td className="px-4 py-3">{ag.agreement.name}</td>
                  <td className="px-4 py-3">{formatDate(ag.updated_at)}</td>
                  <td className="px-4 py-3 capitalize">{ag.status || 'unsigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {pageItems.map((ag) => (
            <div key={ag.id} onClick={() => openAgreement(ag)}>
              <MobileCard
                header={<span className="truncate font-medium">{ag.contact.first_name} {ag.contact.last_name}</span>}
                action={<span className="rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{ag.status || 'unsigned'}</span>}
                rows={[
                  { icon: <FileText size={18} />, value: ag.agreement.name },
                  { icon: <Calendar size={18} />, value: formatDate(ag.updated_at) },
                  { icon: <BadgeCheck size={18} />, value: ag.status === 'signed' ? 'Tap to download PDF' : 'Tap to sign' },
                ]}
              />
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2 mt-4 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded bg-white disabled:opacity-40"
            >
              Prev
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 border rounded bg-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {signContent != null && signId != null && (
        <SignAgreement
          agreementContent={signContent}
          agreementId={signId}
          onClose={() => { setSignContent(null); setSignId(null) }}
          onAgreementUpdated={onAgreementUpdated}
        />
      )}
    </div>
  )
}
