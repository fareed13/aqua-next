'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from '@/hooks/useAuth'
import dynamic from 'next/dynamic'
import { PdfList } from '@/components/admin/pdfBuilder/PdfList'
import { OrganizationAddEdit } from '@/components/admin/organization/OrganizationAddEdit'
import { ServiceClasses } from '@/components/classes/ServiceClasses'
import { SETTINGS_SECTIONS } from '@/lib/config/adminMenuList'

// Big admin-only forms — lazy so they stay out of the settings route's initial chunk.
const LocationAddEdit = dynamic(
  () => import('@/components/admin/locations/LocationAddEdit').then((m) => m.LocationAddEdit),
  { ssr: false },
)
const StaffDefault = dynamic(
  () => import('@/components/admin/staffBlocks/StaffDefault').then((m) => m.StaffDefault),
  { ssr: false },
)
const OrganizationPWA = dynamic(
  () => import('@/components/admin/organization/OrganizationPWA').then((m) => m.OrganizationPWA),
  { ssr: false },
)
const BulkUpload = dynamic(() => import('@/components/admin/bulkMemberUpload/BulkUpload').then((m) => m.BulkUpload), { ssr: false })
const BeltsList = dynamic(() => import('@/components/admin/belts/BeltsList').then((m) => m.BeltsList), { ssr: false })
const AttendanceList = dynamic(() => import('@/components/admin/attendance/AttendanceList').then((m) => m.AttendanceList), { ssr: false })
const ReservedClassesList = dynamic(() => import('@/components/admin/reservedClasses/ReservedClassesList').then((m) => m.ReservedClassesList), { ssr: false })
const AdminAgreementList = dynamic(() => import('@/components/admin/agreements/AgreementList').then((m) => m.AgreementList), { ssr: false })
const Purchases = dynamic(() => import('@/components/admin/purchases/Purchases').then((m) => m.Purchases), { ssr: false })
const ReceiptEditor = dynamic(() => import('@/components/admin/receipts/ReceiptEditor').then((m) => m.ReceiptEditor), { ssr: false })
const PaymentIntegrations = dynamic(() => import('@/components/paymentIntegrations/PaymentIntegrations').then((m) => m.PaymentIntegrations), { ssr: false })
const RefundPolicy = dynamic(() => import('@/components/policies/Refund').then((m) => m.RefundPolicy), { ssr: false })
const LastFifteenDay = dynamic(() => import('@/components/reports/LastFiftenDay').then((m) => m.LastFifteenDay), { ssr: false })
const NoShowReport = dynamic(() => import('@/components/reports/NoShow').then((m) => m.NoShowReport), { ssr: false })
const NewMemberReport = dynamic(() => import('@/components/reports/NewMember').then((m) => m.NewMemberReport), { ssr: false })
const RenewalReport = dynamic(() => import('@/components/reports/RenewalReport').then((m) => m.RenewalReport), { ssr: false })
const BirthdayReport = dynamic(() => import('@/components/reports/Birthday').then((m) => m.BirthdayReport), { ssr: false })
// const KeywordsRanking = dynamic(() => import('@/components/admin/keywords/KeywordsRanking').then((m) => m.KeywordsRanking), { ssr: false })
const AbbiLeadsReport = dynamic(() => import('@/components/reports/abbiLeads/AbbiLeadsReport').then((m) => m.AbbiLeadsReport), { ssr: false })
// const AnalyticsReport = dynamic(() => import('@/components/reports/analytics/Analytics').then((m) => m.Analytics), { ssr: false })

export function AllSettings() {
  const organization = useOrgStore(s => s.organization)
  const setSettingsVisibleSection = useUiStore(s => s.setSettingsVisibleSection)
  const { isSuperAdminLoggedIn } = useAuth()

  const [openSection, setOpenSection] = useState<number | null>(101)
  const [openChild, setOpenChild] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  // The site nav is itself `sticky top-0`; stick the search bar directly BELOW it
  // (Nuxt reads #top_navbar height and offsets the same way) so it doesn't hide behind it.
  const [stickyTop, setStickyTop] = useState(85)

  useEffect(() => {
    const measure = () => {
      const headers = Array.from(document.querySelectorAll('header'))
      const nav = headers.find((h) => getComputedStyle(h).position === 'sticky') || headers[0]
      if (nav) setStickyTop((nav as HTMLElement).offsetHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const sections = useMemo(() => {
    let list = [...SETTINGS_SECTIONS]
    if (!isSuperAdminLoggedIn()) {
      list = list.map(section => {
        const s = { ...section, items: [...section.items] }
        if (s.title === 'Business Essentials') {
          s.items = s.items.map(item => ({
            ...item,
            nested: item.nested?.filter(n => n.title !== 'Organization PWA'),
          }))
        }
        // Non-super-admins: hide Advertising, and keep only Media Manager under Google Business.
        if (s.title === 'Marketing & Analytics') {
          s.items = s.items
            .filter(item => item.title !== 'Advertising')
            .map(item =>
              item.title === 'Google Business'
                ? { ...item, nested: item.nested?.filter(n => n.title === 'Media Manager') }
                : item
            )
        }
        if (s.title === 'System Settings') {
          s.items = s.items.filter(item => item.title !== 'Users')
        }
        return s
      })
    }
    if (!organization?.chatbot_enabled) {
      list = list.map(section => ({
        ...section,
        items: section.items.map(item => ({
          ...item,
          nested: item.nested?.filter(n => n.id !== 4019),
        })),
      }))
    }
    return list
  }, [isSuperAdminLoggedIn, organization?.chatbot_enabled])

  const searchableTitles = useMemo(() => {
    const titles: Array<{ id: number; nestedId?: number; title: string; description?: string }> = []
    sections.forEach(section => {
      section.items.forEach(item => {
        if (item.component) {
          titles.push({ id: item.id, title: item.title, description: item.description })
        }
        item.nested?.forEach(n => {
          if (n.component) {
            titles.push({ id: item.id, nestedId: n.id, title: n.title, description: n.description })
          }
        })
      })
    })
    return titles
  }, [sections])

  const filteredTitles = search
    ? searchableTitles.filter(t => t.title.toLowerCase().includes(search.toLowerCase()))
    : []

  const handleSearchSelect = (item: typeof searchableTitles[0]) => {
    setOpenSection(item.id)
    setOpenChild(item.nestedId ?? null)
    setSearch('')
    setTimeout(() => {
      const el = document.getElementById(String(item.nestedId ?? item.id))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        // offset for the sticky nav + the sticky search bar (~60px), matching Nuxt.
        window.scrollBy(0, -(stickyTop + 60))
      }
    }, 300)
  }

  useEffect(() => {
    return () => {
      setSettingsVisibleSection(openSection ? { parent: openSection, child: openChild } as any : null)
    }
  }, [openSection, openChild])

  // Renders the real ported component for a leaf id, else a placeholder (parity
  // with Nuxt's big v-if switch; only a subset is ported so far).
  const renderComponent = (id: number, title: string) => {
    if (id === 1011) return <OrganizationAddEdit />
    if (id === 1012) return <LocationAddEdit />
    if (id === 1013) return <ServiceClasses />
    if (id === 1014) return <StaffDefault />
    if (id === 1015) return <OrganizationPWA />
    if (id === 1021) return <BulkUpload />
    if (id === 1022) return <BeltsList />
    if (id === 1023) return <AttendanceList />
    if (id === 1024) return <ReservedClassesList />
    if (id === 1025) return <AdminAgreementList />
    if (id === 201) return <Purchases />
    if (id === 202) return <ReceiptEditor field="trial_receipt" title="Trial Receipt" subtitle="Manage organization trial receipt" errorLabel="Trial Receipt" />
    if (id === 203) return <PaymentIntegrations />
    if (id === 204) return <RefundPolicy />
    if (id === 205) return <ReceiptEditor field="booking_receipt" title="Booking Receipt" subtitle="Manage organization booking receipt" errorLabel="Booking Receipt" />
    if (id === 3011) return "<KeywordsRanking />"
    if (id === 3012) return <LastFifteenDay />
    if (id === 3013) return <NoShowReport />
    if (id === 3014) return <NewMemberReport />
    if (id === 3015) return <RenewalReport />
    if (id === 3016) return <BirthdayReport />
    if (id === 3017) return <AbbiLeadsReport />
    if (id === 3018) return "<AnalyticsReport />"
    if (id === 4018) return <PdfList />
    return (
      <div className="flex min-h-[120px] items-center justify-center text-sm text-gray-400">
        {title} — coming soon
      </div>
    )
  }

  const componentContainer = (node: React.ReactNode) => (
    <div className="min-h-[500px] rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_-1px_rgba(0,0,0,0.1),0_0_0_1px_rgba(18,78,102,0.05)]">
      {node}
    </div>
  )

  return (
    <div className="-mt-[42px] min-h-screen bg-[#f1f5f9]">
      {/* Sticky search (Nuxt solo rounded autocomplete, centered) — offset below the sticky nav */}
      <div className="sticky z-40 bg-[#f1f5f9] p-2" style={{ top: stickyTop }}>
        <div className="relative mx-auto max-w-[496px]">
          <Search size={22} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/60" />
          <input
            type="text"
            className="w-full rounded-full bg-white px-4 py-2.5 pl-12 text-[15px] shadow-sm outline-none focus:ring-2 focus:ring-[#124e66]/30"
            placeholder="Search section"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {filteredTitles.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-xl border bg-white shadow-lg">
              {filteredTitles.map(item => (
                <button
                  key={`${item.id}-${item.nestedId}`}
                  onClick={() => handleSearchSelect(item)}
                  className="w-full border-b px-4 py-2.5 text-left last:border-0 hover:bg-gray-50"
                >
                  <div className="font-medium text-[#1e293b]">{item.title}</div>
                  {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Section cards */}
      <div className="mx-auto space-y-2 px-2 pb-8 pt-4 md:px-6">
        {sections.map(section => (
          <div
            key={section.id}
            className="overflow-hidden rounded-2xl bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(18,78,102,0.05)] transition duration-200 hover:-translate-y-0.5"
          >
            {/* Teal section header */}
            <div className="relative bg-[#124E66] px-6 py-4">
              <h2 className="flex items-center justify-center text-center text-xl font-semibold uppercase tracking-wide text-white md:text-2xl">
                {section.title}
              </h2>
            </div>

            {/* Section content: item accordion */}
            <div className="space-y-2 bg-white px-3 py-2 md:px-6">
              {section.items.map(item => {
                const open = openSection === item.id
                return (
                  <div
                    key={item.id}
                    id={String(item.id)}
                    className={`overflow-hidden rounded-xl border transition ${open ? 'border-[#124e66]/30' : 'border-transparent hover:border-[#124e66] hover:bg-[#f8fafc]'}`}
                  >
                    <button
                      onClick={() => { setOpenSection(open ? null : item.id); setOpenChild(null) }}
                      className="flex min-h-[42px] w-full items-center justify-between px-4 py-2.5 text-left md:px-6"
                    >
                      <span className="flex flex-col gap-1">
                        <span className="text-lg font-semibold text-[#1e293b]">{item.title}</span>
                        {item.description && <span className="text-sm text-[#64748b]">{item.description}</span>}
                      </span>
                      <ChevronDown size={20} className={`shrink-0 text-[#124e66] transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>

                    {open && (
                      <div className="border-t border-[rgba(18,78,102,0.08)] bg-white px-3 md:px-6">
                        {item.component && componentContainer(renderComponent(item.id, item.title))}

                        {/* Nested (level-3) accordion */}
                        {item.nested && item.nested.length > 0 && (
                          <div className="space-y-2">
                            {item.nested.map(nested => {
                              const nOpen = openChild === nested.id
                              return (
                                <div key={nested.id} id={String(nested.id)} className="overflow-hidden rounded-lg border border-gray-200">
                                  <button
                                    onClick={() => setOpenChild(nOpen ? null : nested.id)}
                                    className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-[#f8fafc]"
                                  >
                                    <span className="text-[15px] font-medium text-[#1e293b]">
                                      {nested.title}
                                      {nested.description && <span className="ml-1 text-sm text-[#64748b]">({nested.description})</span>}
                                    </span>
                                    <ChevronDown size={18} className={`shrink-0 text-[#124e66] transition-transform ${nOpen ? 'rotate-180' : ''}`} />
                                  </button>
                                  {nOpen && (
                                    <div className="border-t border-gray-100 px-3 py-3">
                                      {componentContainer(renderComponent(nested.id, nested.title))}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
