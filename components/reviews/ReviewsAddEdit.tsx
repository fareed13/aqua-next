'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const PLATFORMS = [
  { text: 'Facebook', value: 'Facebook' },
  { text: 'Google',   value: 'Google' },
  { text: 'Yelp',     value: 'Yelp' },
  { text: 'None',     value: '' },
]

interface ReviewsAddEditProps {
  popup: boolean
  review?: Record<string, any> | null
  onToggleEditPopup: () => void
}

export function ReviewsAddEdit({ popup, review, onToggleEditPopup }: ReviewsAddEditProps) {
  const organization = useOrgStore(s => s.organization)

  const { postSecure, putSecure, secureEndpoint } = useSecureCalls()

  const [id, setId] = useState<number | null>(null)
  const [platform, setPlatform] = useState('')
  const [content, setContent] = useState('')
  const [rating, setRating] = useState('')
  const [reviewerName, setReviewerName] = useState('')
  const [url, setUrl] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [services, setServices] = useState<any[]>([])
  const [serviceId, setServiceId] = useState<number[]>([])
  const [isApproved, setIsApproved] = useState(false)
  const [datetime, setDatetime] = useState('')
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<string | null>(null)
  const [errors, setErrors] = useState<string[]>([])
  const [topicInput, setTopicInput] = useState('')

  // Populate form when review prop changes
  useEffect(() => {
    if (review) {
      setId(review.id ?? null)
      setContent(review.content ?? '')
      setRating(review.rating ?? '')
      setPlatform(review.platform ?? '')
      setReviewerName(review.name ?? '')
      setUrl(review.url ?? '')
      setSelectedTopics(review.topics ?? [])
      setServiceId(review.services ?? [])
      setIsApproved(review.is_approved ?? false)
      setDatetime(review.date_created ?? '')
    } else {
      setId(null)
      setContent('')
      setRating('')
      setPlatform('')
      setReviewerName('')
      setUrl('')
      setSelectedTopics([])
      setServiceId([])
      setIsApproved(false)
      setDatetime('')
      setMediaFile(null)
      setMediaUrl(null)
      setMediaType(null)
    }
  }, [review])

  // Derive preview URL when file changes
  useEffect(() => {
    if (mediaFile) {
      const objectUrl = URL.createObjectURL(mediaFile)
      setMediaUrl(objectUrl)
      setMediaType(mediaFile.type)
      return () => URL.revokeObjectURL(objectUrl)
    } else {
      setMediaUrl(null)
      setMediaType(null)
    }
  }, [mediaFile])

  const validate = () => {
    const errs: string[] = []
    if (!content.trim()) errs.push('Content is required')
    if (!rating) errs.push('Rating is required')
    const num = Number(rating)
    if (rating && (num < 0 || num > 5)) errs.push('Rating must be between 0 and 5')
    setErrors(errs)
    return errs.length === 0
  }

  const buildPayload = () => ({
    platform: platform || null,
    content,
    rating,
    name: reviewerName,
    url,
    topics: selectedTopics,
    date_created: datetime || null,
    is_approved: isApproved,
    services: serviceId,
  })

  const handleCreate = async () => {
    if (!validate()) return
    try {
      await postSecure(SECURE_ENDPOINTS.ORG_REVIEW, {
        ...buildPayload(),
        organization_id: organization?.id,
      })
      onToggleEditPopup()
    } catch {
      onToggleEditPopup()
    }
  }

  const handleUpdate = async () => {
    if (!validate()) return
    try {
      await putSecure(SECURE_ENDPOINTS.ORG_REVIEW, { id, ...buildPayload() })
      onToggleEditPopup()
    } catch {
      onToggleEditPopup()
    }
  }

  const isImagePreview =
    mediaUrl && mediaType && (mediaType === 'image/png' || mediaType === 'image/jpg' || mediaType === 'image/jpeg')
  const isVideoPreview =
    mediaUrl && mediaType && (mediaType === 'video/mp4' || mediaType === 'video/webm')

  if (!popup) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded w-full max-w-[500px] max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onToggleEditPopup}
          className="absolute top-3 right-3 z-10 text-gray-500 hover:text-black"
          aria-label="Close review dialog"
        >
          ✕
        </button>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Add'} Review</h2>

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded text-red-700 text-sm">
              {errors.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}

          <form onSubmit={e => e.preventDefault()} className="flex flex-col gap-4">
            {/* Platform */}
            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <select
                value={platform}
                onChange={e => setPlatform(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="">Select platform</option>
                {PLATFORMS.map(p => (
                  <option key={p.value} value={p.value}>{p.text}</option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                name="Content"
                required
              />
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Rating (0–5) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={rating}
                onChange={e => setRating(e.target.value)}
                min={0}
                max={5}
                step={0.1}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                name="Rating"
                required
              />
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                value={reviewerName}
                onChange={e => setReviewerName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            {/* URL */}
            <div>
              <label className="block text-sm font-medium mb-1">URL</label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>

            {/* Topics combobox */}
            <div>
              <label className="block text-sm font-medium mb-1">Topics</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={topicInput}
                  onChange={e => setTopicInput(e.target.value)}
                  placeholder="Add topic and press Enter"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                  onKeyDown={e => {
                    if (e.key === 'Enter' && topicInput.trim()) {
                      e.preventDefault()
                      if (!selectedTopics.includes(topicInput.trim())) {
                        setSelectedTopics(prev => [...prev, topicInput.trim()])
                      }
                      setTopicInput('')
                    }
                  }}
                />
              </div>
              {selectedTopics.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedTopics.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 bg-gray-200 text-sm px-2 py-0.5 rounded">
                      {t}
                      <button
                        type="button"
                        onClick={() => setSelectedTopics(prev => prev.filter(x => x !== t))}
                        className="text-gray-500 hover:text-black"
                        aria-label={`Remove topic ${t}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Is Approved toggle */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Is Approved?</label>
              <button
                type="button"
                onClick={() => setIsApproved(v => !v)}
                className={`relative inline-flex w-10 h-6 rounded-full transition-colors ${isApproved ? 'bg-green-500' : 'bg-gray-300'}`}
                aria-label={isApproved ? 'Approved' : 'Not approved'}
              >
                <span
                  className={`inline-block w-4 h-4 mt-1 rounded-full bg-white shadow transition-transform ${isApproved ? 'translate-x-5' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Created / Date Added</label>
              <input
                type="date"
                value={datetime}
                onChange={e => setDatetime(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-[#f5f5f8]"
              />
            </div>

            {/* Media preview */}
            {isImagePreview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl!} alt="Review image preview" className="w-full" />
            )}
            {isVideoPreview && (
              <video src={mediaUrl!} controls className="w-full" aria-label="Review video preview" />
            )}

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium mb-1">Upload Media</label>
              <input
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={e => setMediaFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm"
              />
              {mediaFile && (
                <button
                  type="button"
                  onClick={() => setMediaFile(null)}
                  className="mt-1 text-xs text-red-600 underline"
                >
                  Clear file
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-2">
              {id ? (
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-[#0c3cac] text-white rounded text-sm"
                  aria-label="Update review"
                >
                  Update
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="px-4 py-2 bg-[#0c3cac] text-white rounded text-sm"
                  aria-label="Create review"
                >
                  Create
                </button>
              )}
              <button
                type="button"
                onClick={onToggleEditPopup}
                className="px-4 py-2 bg-[#d90000] text-white rounded text-sm"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
