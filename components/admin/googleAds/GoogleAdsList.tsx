'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Plus, Megaphone, Tag, FileText, Activity, DollarSign } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { MobileCard } from '@/components/customers/MobileCard'
import { Pagination } from '@/components/admin/belts/BeltsList'
import { ApiError } from '@/lib/api/httpClient'
import { GoogleAdsAddEdit } from './GoogleAdsAddEdit'

interface GoogleAd {
  id: number
  resource_name: string
  status: string
  monthly_budget: number | string
  headlines?: string[]
  descriptions?: string[]
}

const NO_CUSTOMER_ID = 'organization does not have google account customer_id'

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const data = err.data
    if (data && typeof data === 'object' && 'messages' in data) {
      const m = (data as { messages: unknown }).messages
      if (typeof m === 'string') return m
    }
    if (typeof data === 'string' && data) return data
  }
  return 'Something went wrong'
}

function isNoCustomerIdError(err: unknown): boolean {
  return err instanceof ApiError && err.data === NO_CUSTOMER_ID
}

function Chips({ items }: { items?: string[] }) {
  if (!items || !items.length) return <span className="text-gray-400">- - -</span>
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((v, i) => (
        <span key={i} className="rounded-full bg-[#fb0062] px-2 py-0.5 text-xs text-white">
          {v}
        </span>
      ))}
    </div>
  )
}

export function GoogleAdsList() {
  const organization = useOrgStore((s) => s.organization)
  const currencySign = organization?.currency_sign ?? '$'
  const { getSecure, putSecure } = useSecureCalls()

  const [adsData, setAdsData] = useState<GoogleAd[]>([])
  const [overlay, setOverlay] = useState(true)
  const [addButtonDisability, setAddButtonDisability] = useState(false)
  const [mode, setMode] = useState<'list' | 'create'>('list')

  const [selectedAd, setSelectedAd] = useState<GoogleAd | null>(null)
  const [updating, setUpdating] = useState(false)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const fetchAds = async () => {
    try {
      setOverlay(true)
      const res = await getSecure<GoogleAd[]>(SECURE_ENDPOINTS.GOOGLE_ADS)
      setAdsData(Array.isArray(res) ? res : [])
    } catch (err) {
      toast.error(errorMessage(err), { duration: 5000 })
      if (isNoCustomerIdError(err)) setAddButtonDisability(true)
    } finally {
      setOverlay(false)
    }
  }

  useEffect(() => {
    fetchAds()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const totalPages = Math.max(1, Math.ceil(adsData.length / perPage))
  const pageItems = adsData.slice((page - 1) * perPage, page * perPage)
  useEffect(() => {
    setPage(1)
  }, [perPage])

  const statusLabel = (status: string) => (status === 'ENABLED' ? 'PAUSE' : 'ENABLE')

  const confirmUpdate = async () => {
    if (!selectedAd) return
    try {
      setUpdating(true)
      const status = selectedAd.status === 'ENABLED' ? 'PAUSED' : 'ENABLED'
      const response = await putSecure<{ resource_name: string }>(SECURE_ENDPOINTS.GOOGLE_ADS, {
        id: selectedAd.id,
        resource_name: selectedAd.resource_name,
        status,
      })
      setAdsData((prev) =>
        prev.map((ad) =>
          ad.id === selectedAd.id
            ? { ...ad, status, resource_name: response?.resource_name ?? ad.resource_name }
            : ad,
        ),
      )
      toast.success('Updated Successfully', { duration: 3000 })
      setSelectedAd(null)
    } catch (err) {
      toast.error(errorMessage(err), { duration: 5000 })
      setSelectedAd(null)
    } finally {
      setUpdating(false)
    }
  }

  if (mode === 'create') {
    return (
      <GoogleAdsAddEdit
        onClose={() => setMode('list')}
        onSaved={() => {
          setMode('list')
          fetchAds()
        }}
      />
    )
  }

  return (
    <div className="relative min-h-full bg-[#f5f5f8]">
      {overlay && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#1565C0] border-t-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="bg-[#124e66] p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-medium text-white md:text-2xl">
              <Megaphone size={24} /> Google Ads
            </h1>
            <p className="text-sm text-white/70">Manage your Google Ads campaigns</p>
          </div>
          <button
            onClick={() => setMode('create')}
            disabled={addButtonDisability}
            className="inline-flex items-center justify-center gap-1 rounded bg-[#1565C0] px-6 py-2.5 text-sm font-semibold uppercase text-white hover:bg-[#0d4a94] disabled:opacity-50"
          >
            <Plus size={18} /> Create Google Ad
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-4 py-5">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto rounded border bg-white shadow-sm md:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold">Headlines</th>
                <th className="px-4 py-3 font-semibold">Descriptions</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Monthly Budget</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((ad) => (
                <tr key={ad.id} className="border-b align-top hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Chips items={ad.headlines} />
                  </td>
                  <td className="px-4 py-3">
                    <Chips items={ad.descriptions} />
                  </td>
                  <td className="px-4 py-3">{ad.status}</td>
                  <td className="px-4 py-3">
                    {currencySign}
                    {ad.monthly_budget}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedAd(ad)}
                      className="rounded bg-[#1565C0] px-4 py-1.5 text-xs font-semibold uppercase text-white hover:bg-[#0d4a94]"
                    >
                      {statusLabel(ad.status)}
                    </button>
                  </td>
                </tr>
              ))}
              {!overlay && pageItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No Google Ads Found
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
                  <Tag size={18} className="text-[#6D6D6D]" />
                  <span className="font-medium">{ad.headlines?.[0] ?? 'Google Ad'}</span>
                </>
              }
              action={
                <button
                  onClick={() => setSelectedAd(ad)}
                  className="rounded bg-[#1565C0] px-3 py-1 text-xs font-semibold uppercase text-white"
                >
                  {statusLabel(ad.status)}
                </button>
              }
              rows={[
                { icon: <Tag size={18} />, value: <Chips items={ad.headlines} /> },
                { icon: <FileText size={18} />, value: <Chips items={ad.descriptions} /> },
                { icon: <Activity size={18} />, value: `Status: ${ad.status}` },
                {
                  icon: <DollarSign size={18} />,
                  value: `Monthly Budget: ${currencySign}${ad.monthly_budget}`,
                },
              ]}
            />
          ))}
          {!overlay && pageItems.length === 0 && (
            <p className="py-10 text-center text-gray-500">No Google Ads Found</p>
          )}
        </div>

        {adsData.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
            perPage={perPage}
            setPerPage={setPerPage}
            total={adsData.length}
          />
        )}
      </div>

      <DeleteWarning
        popup={!!selectedAd}
        message="Do You Really want to Update this item?"
        loading={updating}
        onConfirm={confirmUpdate}
        onCancel={() => setSelectedAd(null)}
      />
    </div>
  )
}
