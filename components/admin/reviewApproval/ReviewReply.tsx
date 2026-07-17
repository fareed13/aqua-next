'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Reply } from 'lucide-react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface ReviewReplyProps {
  open: boolean
  reviewId: number | null
  locationId: number | null
  onClose: () => void
  onResponded: (reviewId: number) => void
}

/** Ports Nuxt components/reviewApproval/ReviewReply.vue — the Google review reply dialog. */
export function ReviewReply({ open, reviewId, locationId, onClose, onResponded }: ReviewReplyProps) {
  const { putSecure } = useSecureCalls()
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const createReply = async () => {
    if (!message.trim()) {
      toast.error('Please Write Your Reply', { duration: 5000 })
      return
    }
    try {
      setLoading(true)
      await putSecure(SECURE_ENDPOINTS.GOOGLE_REPLY, {
        location_id: locationId,
        review_id: reviewId,
        message,
      })
      toast.success('Google Reply Successfully Posted', { duration: 3000 })
      if (reviewId != null) onResponded(reviewId)
      setMessage('')
      onClose()
    } catch (err: any) {
      const detail = err?.data?.error || err?.response?.data?.error || err?.data || err?.message
      toast.error(detail ? `${detail}` : 'Error replying to review', { duration: 5000 })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[700px] rounded bg-white shadow-lg">
        <div className="flex items-center gap-2 px-6 py-4">
          <h2 className="text-lg font-semibold">Create Review Reply</h2>
          <Reply size={18} className="text-gray-500" />
        </div>
        <hr />
        <div className="px-6 py-4">
          <p className="mb-3 text-sm text-gray-600">Please write a reply for the selected google review</p>
          <hr className="mb-4" />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Reply Message"
            rows={5}
            className="w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#175383] focus:outline-none focus:ring-1 focus:ring-[#175383]"
          />
        </div>
        <hr />
        <div className="flex justify-end gap-2 px-6 py-4">
          <button
            onClick={createReply}
            disabled={loading}
            className="rounded bg-[#175383] px-5 py-2 font-medium text-white disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded bg-gray-200 px-5 py-2 font-medium text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
