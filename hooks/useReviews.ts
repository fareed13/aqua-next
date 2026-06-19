'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from './useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from './apiCalls/useApiCalls'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Review } from '@/types/api'

interface UseReviewsProps {
  headline?: string
  service_id?: number
  count_of_reviews?: number
}

export function useReviews(props: UseReviewsProps = {}) {
  const organization = useOrgStore(s => s.organization)
  const location = useOrgStore(s => s.location)
  const setReviewDialog = useUiStore(s => s.setReviewDialog)
  const { getUser, isAdminLoggedIn } = useAuth()
  const { postSecure, deleteSecure } = useSecureCalls()

  const orgReviews = organization?.org_reviews ?? []
  const industryType = organization?.industry_type ?? ''

  const [reviews, setReviews] = useState<Review[]>([])
  const [editPopup, setEditPopup] = useState(false)
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [deletePopup, setDeletePopup] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadedMedia, setUploadedMedia] = useState<File | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  const heading = useMemo(() => {
    if (props.headline) return props.headline
    if (industryType === 'salon') return 'Hear what our clients are saying'
    return 'Hear what our members are saying'
  }, [props.headline, industryType])

  const mediaUrl = useMemo(() => {
    if (uploadedMedia) return URL.createObjectURL(uploadedMedia)
    return ''
  }, [uploadedMedia])

  useEffect(() => {
    let filtered = props.service_id
      ? orgReviews.filter(r => r.services?.includes(props.service_id!))
      : orgReviews
    filtered = filtered.slice(0, props.count_of_reviews ?? 6)
    setReviews(filtered)

    if (typeof window !== 'undefined') {
      setIsMobile(window.matchMedia('(max-width: 800px)').matches)
    }
  }, [orgReviews, props.service_id, props.count_of_reviews])

  const toggleDeletePopup = useCallback((item?: Review | null) => {
    setSelectedReview(item ?? null)
    setDeletePopup(!!item)
  }, [])

  const toggleEditPopup = useCallback((item?: Review | 'new' | null) => {
    if (item === 'new') {
      setSelectedReview(null)
      setEditPopup(true)
    } else {
      setSelectedReview((item as Review) ?? null)
      setEditPopup(!!item)
    }
  }, [])

  const checkUserRole = useCallback(() => {
    const user = getUser()
    return !!user && (user.role === 'org-admin' || user.role === 'superadmin')
  }, [getUser])

  const closeReview = useCallback(() => {
    setReviewDialog(false)
  }, [setReviewDialog])

  const saveReview = useCallback(async () => {
    try {
      if (rating <= 0) throw new Error('Rating is required')
      const user = getUser()
      await postSecure(SECURE_ENDPOINTS.ORG_REVIEW, {
        content: review,
        organization_id: organization?.id,
        rating,
        contact: user?.id,
      })
      setReviewDialog(false)
    } catch (error) {
      console.error(error)
    }
  }, [rating, review, organization, getUser, postSecure, setReviewDialog])

  const deleteReview = useCallback(async () => {
    if (!selectedReview) return
    try {
      await deleteSecure(SECURE_ENDPOINTS.ORG_REVIEW, selectedReview.id)
      toggleDeletePopup(null)
    } catch {
      toggleDeletePopup(null)
    }
  }, [selectedReview, deleteSecure, toggleDeletePopup])

  return {
    reviews,
    rating,
    setRating,
    review,
    setReview,
    editPopup,
    isMobile,
    loading,
    setLoading,
    selectedReview,
    deletePopup,
    uploadedMedia,
    setUploadedMedia,
    mediaUrl,
    heading,
    industryType,
    setReviewDialog,
    toggleDeletePopup,
    toggleEditPopup,
    checkUserRole,
    closeReview,
    saveReview,
    deleteReview,
  }
}
