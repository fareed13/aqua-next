'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import type { Review } from '@/types/api'

export function ReviewApproval() {
  const router = useRouter()
  const { isAdminLoggedIn } = useAuth()
  const organization = useOrgStore(s => s.organization)
  const { getSecure, putSecure, deleteSecure } = useSecureCalls()

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return }
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await getSecure<Review[]>(SECURE_ENDPOINTS.ORG_REVIEW)
      setReviews(res ?? [])
    } catch { /* handled */ }
    finally { setLoading(false) }
  }

  const toggleApproval = async (review: Review) => {
    try {
      await putSecure(SECURE_ENDPOINTS.ORG_REVIEW, {
        id: review.id,
        is_approved: !review.is_approved,
      })
      setReviews(prev => prev.map(r => r.id === review.id ? { ...r, is_approved: !r.is_approved } : r))
    } catch { /* handled */ }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteSecure(SECURE_ENDPOINTS.ORG_REVIEW, id)
      setReviews(prev => prev.filter(r => r.id !== id))
    } catch { /* handled */ }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-xl font-bold mb-6">Reputation Management</h2>
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No reviews to approve</div>
      ) : (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white border rounded shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <strong>{review.name ?? 'Anonymous'}</strong>
                    <span className="text-yellow-500">
                      {'★'.repeat(review.rating ?? 0)}{'☆'.repeat(5 - (review.rating ?? 0))}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {review.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.content}</p>
                  <p className="text-gray-400 text-xs mt-1">{review.platform ?? ''} - {review.date_created ?? review.created_at}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => toggleApproval(review)}
                    className={`px-3 py-1 rounded text-sm font-semibold ${review.is_approved ? 'bg-yellow-100 text-yellow-700' : 'bg-green-600 text-white'}`}>
                    {review.is_approved ? 'Unapprove' : 'Approve'}
                  </button>
                  <button onClick={() => handleDelete(review.id)}
                    className="px-3 py-1 rounded text-sm font-semibold bg-red-600 text-white">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
