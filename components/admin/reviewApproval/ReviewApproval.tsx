'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { BookMarked, CheckSquare, Reply, ChevronDown, ChevronUp, User } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import type { Review } from '@/types/api'
import { ReviewReply } from './ReviewReply'

// The list endpoint returns contact as an object + an is_responded flag that the
// generated Review type doesn't carry; widen locally.
type ReviewRow = Omit<Review, 'contact'> & {
  is_responded?: boolean
  contact?: { first_name?: string; last_name?: string } | number | null
}

const SOURCE_OPTIONS = ['all', 'Facebook', 'Google', 'Yelp']
const RESPONDED_OPTIONS = [
  { label: 'all', value: 'all' },
  { label: 'Responded', value: 'true' },
  { label: 'Non Responded', value: 'false' },
]
const APPROVED_OPTIONS = [
  { label: 'all', value: 'all' },
  { label: 'Approved', value: 'true' },
  { label: 'Non Approved', value: 'false' },
]

function platformClasses(platform: string | null): string {
  switch (platform) {
    case 'Google': return 'bg-[#e3f0fd] text-[#1976d2]'
    case 'Facebook': return 'bg-[#e3f2fd] text-[#1565c0]'
    case 'Yelp': return 'bg-[#fff3e0] text-[#f57c00]'
    default: return 'bg-[#e6f4ea] text-[#2e7d32]'
  }
}

function contactName(rev: ReviewRow): string {
  const c = rev.contact
  if (c && typeof c === 'object') return `${c.first_name ?? ''} ${c.last_name ?? ''}`.trim() || '----'
  return '----'
}

export function ReviewApproval() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAdminLoggedIn } = useAuth()
  const locations = useOrgStore((s) => s.locations)
  const location = useOrgStore((s) => s.location)
  const { getSecure, putSecure, postSecure } = useSecureCalls()

  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [overlay, setOverlay] = useState(false)
  const [loading, setLoading] = useState(true)

  // Filters (Nuxt: source / responded / approved / location)
  const [source, setSource] = useState('all')
  const [responded, setResponded] = useState('all')
  const [approved, setApproved] = useState('all')
  const [locationsId, setLocationsId] = useState<number | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Reply dialog
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyReviewId, setReplyReviewId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    ;(async () => {
      setOverlay(true)
      try {
        const res = await getSecure<ReviewRow[]>(SECURE_ENDPOINTS.ORG_REVIEW)
        setReviews(Array.isArray(res) ? res : [])

        // Preset filters from query params (Nuxt onMounted).
        const isResponded = searchParams.get('is_responded')
        if (isResponded) setResponded(parseInt(isResponded) === 1 ? 'true' : 'false')
        const isApproved = searchParams.get('is_approved')
        if (isApproved) setApproved(parseInt(isApproved) === 1 ? 'true' : 'false')
        const platform = searchParams.get('platform')
        if (platform && SOURCE_OPTIONS.includes(platform)) setSource(platform)

        // Single-location orgs: preselect it so replies work without picking a location.
        setLocationsId(locations && locations.length === 1 ? (location?.id ?? null) : null)
      } catch (e) {
        console.error(e)
      } finally {
        setOverlay(false)
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredReviews = useMemo(() => {
    let result = reviews
    if (source !== 'all') result = result.filter((r) => r.platform === source)
    if (responded !== 'all') result = result.filter((r) => !!r.is_responded === (responded === 'true'))
    if (approved !== 'all') result = result.filter((r) => !!r.is_approved === (approved === 'true'))
    return result
  }, [reviews, source, responded, approved])

  const showAll = () => setShowFilters(false)

  // One-way approve (Nuxt approve): PUT is_approved:true; button disabled once approved.
  const approve = async (review: ReviewRow) => {
    setOverlay(true)
    try {
      const response = await putSecure<ReviewRow>(SECURE_ENDPOINTS.ORG_REVIEW, {
        id: review.id,
        is_approved: true,
      })
      setReviews((prev) => prev.map((r) => (r.id === review.id ? (response ?? { ...r, is_approved: true }) : r)))
      toast.success('Review Approved successfully', { duration: 15000 })
    } catch {
      toast.error('Review Could not Approved', { duration: 10000 })
    } finally {
      setOverlay(false)
    }
  }

  // Reply (Nuxt reply): requires a location; Google reviews do an access check, then
  // open the dialog, or redirect to google-auth if access is denied.
  const reply = async (rev: ReviewRow) => {
    if (!locationsId) {
      toast.info('Please Select a Location', { duration: 7000 })
      return
    }
    if (rev.platform === 'Google') {
      setOverlay(true)
      try {
        await postSecure(SECURE_ENDPOINTS.GOOGLE_REPLY, { location_id: locationsId })
        setReplyReviewId(rev.id)
        setReplyOpen(true)
      } catch {
        router.push('/admin/google-auth')
      } finally {
        setOverlay(false)
      }
    }
  }

  const respondedToReview = (reviewId: number) =>
    setReviews((prev) => prev.map((r) => (r.id === reviewId ? { ...r, is_responded: true } : r)))

  // ---- shared bits ----
  const selectCls =
    'w-full rounded border border-gray-300 bg-white px-3 py-2.5 text-[15px] outline-none focus:border-[#175383]'

  const filterControls = () => (
    <>
      {locations && locations.length > 0 && (
        <select value={locationsId ?? ''} onChange={(e) => setLocationsId(e.target.value ? Number(e.target.value) : null)} className={selectCls} aria-label="Location">
          <option value="">Location</option>
          {locations.map((l: any) => (
            <option key={l.id} value={l.id}>{(l.target_locations && l.target_locations[0]) || l.city}</option>
          ))}
        </select>
      )}
      <select value={source} onChange={(e) => setSource(e.target.value)} className={selectCls} aria-label="Sort By Source">
        {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s === 'all' ? 'Sort By Source' : s}</option>)}
      </select>
      <select value={responded} onChange={(e) => setResponded(e.target.value)} className={selectCls} aria-label="Sort by Responded">
        {RESPONDED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value === 'all' ? 'Sort by Responded' : o.label}</option>)}
      </select>
      <select value={approved} onChange={(e) => setApproved(e.target.value)} className={selectCls} aria-label="Sort by Approved">
        {APPROVED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value === 'all' ? 'Sort by Approved' : o.label}</option>)}
      </select>
    </>
  )

  const actionButtons = (rev: ReviewRow, size: number) => (
    <div className="flex items-center gap-2">
      <button onClick={() => approve(rev)} disabled={!!rev.is_approved} title="Approve" className="text-green-600 disabled:opacity-30">
        <CheckSquare size={size} />
      </button>
      <button onClick={() => reply(rev)} disabled={!!rev.is_responded} title="Reply" className="text-[#175383] disabled:opacity-30">
        <Reply size={size} />
      </button>
    </div>
  )

  const topics = (rev: ReviewRow) => (
    <div className="flex flex-wrap gap-1">
      {(rev.topics ?? []).map((t, i) => (
        <span key={i} className="rounded-full bg-[#f50264] px-2 py-0.5 text-xs text-white">{t}</span>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f5f8]">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#175383] border-t-transparent" />
        </div>
      )}

      <ReviewReply
        open={replyOpen}
        reviewId={replyReviewId}
        locationId={locationsId}
        onClose={() => setReplyOpen(false)}
        onResponded={respondedToReview}
      />

      {/* ===================== MOBILE ===================== */}
      <div className="md:hidden">
        <div className="bg-[#175383] px-4 pt-4">
          <h3 className="flex items-center gap-2 pb-3 text-lg font-medium text-white">
            <BookMarked size={26} /> Reputation Management
          </h3>
          <div className="flex items-center gap-2 bg-white px-3 py-2">
            <button onClick={showAll} className={`rounded-2xl px-4 py-1 text-[15px] font-medium ${!showFilters ? 'bg-[#e6edfd] text-[#2a4d9b]' : 'bg-[#f5f6fa] text-gray-600'}`}>
              All Reviews
            </button>
            <button onClick={() => setShowFilters((v) => !v)} className={`flex items-center gap-1 rounded-2xl px-4 py-1 text-[15px] font-medium ${showFilters ? 'bg-[#e6edfd] text-[#2a4d9b]' : 'bg-[#f5f6fa] text-gray-600'}`}>
              Filters {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="m-3 space-y-2 rounded bg-white p-3 shadow-sm">
            {filterControls()}
          </div>
        )}

        <div className="space-y-3 px-3 py-3">
          {loading ? (
            <p className="py-10 text-center text-gray-500">Loading reviews…</p>
          ) : filteredReviews.length === 0 ? (
            <p className="py-10 text-center text-gray-500">No reviews to approve</p>
          ) : (
            filteredReviews.map((rev) => (
              <div key={rev.id} className="rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm">
                <div className="flex items-center gap-2">
                  <User size={18} className="text-gray-500" />
                  <span className="text-base font-medium">{contactName(rev)}</span>
                </div>
                <hr className="my-2" />
                <div className="mb-2 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-0.5 text-xs font-medium ${platformClasses(rev.platform)}`}>{rev.platform}</span>
                  {actionButtons(rev, 18)}
                </div>
                <p className="mb-1 text-xs text-gray-500">Topics</p>
                {topics(rev)}
                <p className="mt-2 text-sm leading-relaxed text-gray-700">{rev.content}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===================== DESKTOP ===================== */}
      <div className="hidden md:block">
        <div className="bg-[#175383] px-6 pt-5 pb-16">
          <h3 className="flex items-center gap-2 text-2xl font-semibold text-white">
            <BookMarked size={30} /> Reputation Management
          </h3>
        </div>

        <div className="mx-auto -mt-12 px-4 pb-10">
          <div className="flex gap-4">
            {/* Filter sidebar */}
            <aside className="w-[220px] shrink-0 space-y-3 rounded bg-[#f5f5f8] p-4 shadow-[0px_3px_11px_#cccccc8f]">
              {filterControls()}
            </aside>

            {/* Card grid */}
            <div className="min-w-0 flex-1 rounded bg-white p-4 shadow-[0px_3px_11px_#cccccc8f]">
              {loading ? (
                <p className="py-12 text-center text-gray-500">Loading reviews…</p>
              ) : filteredReviews.length === 0 ? (
                <p className="py-12 text-center text-gray-500">No reviews to approve</p>
              ) : (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredReviews.map((rev) => (
                    <div key={rev.id} className="flex flex-col rounded border border-gray-200 bg-white shadow-sm">
                      <div className="px-4 pt-4 text-lg font-semibold">{contactName(rev)}</div>
                      <hr className="my-2" />
                      <div className="px-4 text-sm text-gray-600">{rev.platform}</div>
                      <div className="px-4 py-2">
                        <p className="mb-1 text-xs text-gray-500">Topics</p>
                        {topics(rev)}
                      </div>
                      <div className="flex-1 px-4 pb-3 text-sm text-gray-700">{rev.content}</div>
                      <hr />
                      <div className="px-2 py-1">{actionButtons(rev, 24)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
