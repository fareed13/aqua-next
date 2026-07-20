'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { BookOpen, Search, Plus, Megaphone } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { MobileCard } from '@/components/customers/MobileCard'
import { Pagination } from '@/components/admin/belts/BeltsList'
import { FacebookAddEdit } from './FacebookAddEdit'

interface FbAd {
  id: number
  ad_id?: string | number
  campaign_name?: string
  name?: string
  delivery_status?: string
  monthly_budget?: string | number
  cost_per_result?: string | number
  cpc?: string | number
  status?: string
}

type AdsType = 'Active Ads' | 'All Ads'
const DROPDOWN_ITEMS: AdsType[] = ['Active Ads', 'All Ads']

const STATUS_COLOR: Record<string, string> = {
  CAMPAIGN_PAUSED: '#f1aa05',
  ADSET_PAUSED: '#f1aa05',
  PAUSED: '#f1aa05',
  ACTIVE: '#4d9221',
  COMPLETED: '#6094f5',
  WITH_ISSUE: '#ff0000',
  WITH_ISSUES: '#ff0000',
}

function extractErrorData(err: unknown): unknown {
  return (err as { response?: { data?: unknown } })?.response?.data
}

export function FacebookAdsList() {
  const router = useRouter()
  const organization = useOrgStore((s) => s.organization)
  const currencySign = organization?.currency_sign ?? '$'
  const { getSecure, putSecure } = useSecureCalls()

  const [overlay, setOverlay] = useState(false)
  const [addButtonDisability, setAddButtonDisability] = useState(false)
  const [selectedDropDown, setSelectedDropDown] = useState<AdsType>('Active Ads')
  const [adsData, setAdsData] = useState<FbAd[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const [selectedAd, setSelectedAd] = useState<FbAd | null>(null)
  const [updatePopup, setUpdatePopup] = useState(false)

  // Inline create view (rendered instead of routing — matches the settings accordion host).
  const [creating, setCreating] = useState(false)

  const fetchAds = async (type: AdsType) => {
    setOverlay(true)
    try {
      const endpoint = type === 'All Ads' ? SECURE_ENDPOINTS.ADS_PREVIEW : SECURE_ENDPOINTS.FB_ADS
      const res = await getSecure<FbAd[]>(endpoint)
      setAdsData(Array.isArray(res) ? res : [])
    } catch (err) {
      if (extractErrorData(err) === 'organization does not have any Facebook Ad account') {
        setAddButtonDisability(true)
      }
      setAdsData([])
    } finally {
      setOverlay(false)
    }
  }

  useEffect(() => {
    fetchAds('Active Ads')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeDropDown = (type: AdsType) => {
    setSelectedDropDown(type)
    fetchAds(type)
  }

  const toggleUpdatePopup = (item: FbAd | null) => {
    setSelectedAd(item)
    setUpdatePopup(!!item)
  }

  const update = async () => {
    if (!selectedAd) return
    setOverlay(true)
    try {
      const newStatus = selectedAd.delivery_status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
      await putSecure(SECURE_ENDPOINTS.FB_ADS, { id: selectedAd.ad_id, status: newStatus })
      setAdsData((prev) =>
        prev.map((ad) => (ad.id === selectedAd.id ? { ...ad, status: newStatus, delivery_status: newStatus } : ad)),
      )
      toast.success('Updated Successfully', { duration: 3000 })
      setUpdatePopup(false)
      setSelectedAd(null)
    } catch {
      setUpdatePopup(false)
      setSelectedAd(null)
    } finally {
      setOverlay(false)
    }
  }

  const isActiveTab = selectedDropDown === 'Active Ads'

  const filtered = useMemo(() => {
    if (!search) return adsData
    const q = search.toLowerCase()
    return adsData.filter((a) =>
      (isActiveTab ? a.campaign_name : a.name)?.toLowerCase().includes(q),
    )
  }, [adsData, search, isActiveTab])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage)
  useEffect(() => {
    setPage(1)
  }, [search, perPage, selectedDropDown])

  const budget = (v: string | number | undefined) => `${currencySign}${parseInt(String(v ?? 0), 10) || 0}`
  const money = (v: string | number | undefined) => `${currencySign}${(parseFloat(String(v ?? 0)) || 0).toFixed(2)}`

  const StatusChip = ({ status }: { status?: string }) => (
    <span
      className="inline-block rounded-full px-3 py-1 text-xs font-bold text-[#f0f0f0]"
      style={{ backgroundColor: (status && STATUS_COLOR[status]) || '#ff0000' }}
    >
      {status}
    </span>
  )

  if (creating) {
    return (
      <FacebookAddEdit
        onClose={() => {
          setCreating(false)
          fetchAds(selectedDropDown)
        }}
      />
    )
  }

  return (
    <div className="min-h-full bg-[#f8fafc]">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="bg-[#124e66] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={24} className="text-white" />
            <div>
              <h1 className="text-xl font-medium text-white md:text-2xl">Facebook Ads</h1>
              <p className="text-sm text-white/70">Manage your Facebook ad campaigns</p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div>
              <span className="mb-1 block text-xs uppercase text-white/90">Choose Ads Type</span>
              <select
                value={selectedDropDown}
                onChange={(e) => changeDropDown(e.target.value as AdsType)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-base outline-none sm:w-52"
              >
                {DROPDOWN_ITEMS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative sm:self-end">
              <Search size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-black/50" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ads..."
                className="w-full rounded-md border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-base outline-none md:w-60"
              />
            </div>
            <button
              onClick={() => setCreating(true)}
              disabled={addButtonDisability}
              className="inline-flex items-center justify-center gap-1 self-end rounded bg-white px-4 py-2.5 text-sm font-medium text-[#124e66] disabled:opacity-50"
              aria-label="Create new Facebook ad"
            >
              <Plus size={18} /> Create Facebook Ad
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto rounded border bg-white shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold">{isActiveTab ? 'Campaign Name' : 'Ad Name'}</th>
                <th className="px-4 py-3 font-semibold">Delivery Status</th>
                <th className="px-4 py-3 font-semibold">Monthly Budget</th>
                {isActiveTab && <th className="px-4 py-3 font-semibold">Cost per Lead</th>}
                {isActiveTab && <th className="px-4 py-3 font-semibold">Cost per Click</th>}
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((ad) => (
                <tr key={ad.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{isActiveTab ? ad.campaign_name : ad.name}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={ad.delivery_status} />
                  </td>
                  <td className="px-4 py-3">{budget(ad.monthly_budget)}</td>
                  {isActiveTab && <td className="px-4 py-3">{money(ad.cost_per_result)}</td>}
                  {isActiveTab && <td className="px-4 py-3">{money(ad.cpc)}</td>}
                  <td className="px-4 py-3 text-right">
                    {isActiveTab ? (
                      <button
                        onClick={() => toggleUpdatePopup(ad)}
                        className="rounded bg-[#1565C0] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0e4a94]"
                      >
                        {ad.delivery_status === 'ACTIVE' ? 'PAUSE' : 'ACTIVATE'}
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/admin/facebook-preview/${ad.id}`)}
                        className="rounded bg-[#1565C0] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0e4a94]"
                      >
                        Edit Preview
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={isActiveTab ? 6 : 4} className="px-4 py-10 text-center text-gray-500">
                    No Facebook Ads Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3 md:hidden">
          {pageItems.map((ad) => (
            <MobileCard
              key={ad.id}
              header={
                <>
                  <Megaphone size={18} className="text-[#6D6D6D]" />
                  <span className="font-medium">{isActiveTab ? ad.campaign_name : ad.name}</span>
                </>
              }
              action={
                isActiveTab ? (
                  <button
                    onClick={() => toggleUpdatePopup(ad)}
                    className="rounded bg-[#1565C0] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    {ad.delivery_status === 'ACTIVE' ? 'PAUSE' : 'ACTIVATE'}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push(`/admin/facebook-preview/${ad.id}`)}
                    className="rounded bg-[#1565C0] px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Edit Preview
                  </button>
                )
              }
              rows={[
                { value: <StatusChip status={ad.delivery_status} /> },
                { value: `Monthly Budget: ${budget(ad.monthly_budget)}` },
                ...(isActiveTab
                  ? [
                      { value: `Cost per Lead: ${money(ad.cost_per_result)}` },
                      { value: `Cost per Click: ${money(ad.cpc)}` },
                    ]
                  : []),
              ]}
            />
          ))}
          {pageItems.length === 0 && <p className="py-10 text-center text-gray-500">No Facebook Ads Found</p>}
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          setPage={setPage}
          perPage={perPage}
          setPerPage={setPerPage}
          total={filtered.length}
        />
      </div>

      <DeleteWarning
        popup={updatePopup}
        message="Do You Really want to Update this item?"
        loading={overlay}
        onConfirm={update}
        onCancel={() => toggleUpdatePopup(null)}
      />
    </div>
  )
}
