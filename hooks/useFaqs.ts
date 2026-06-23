'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNonSecureCalls, NON_SECURE_ENDPOINTS } from './apiCalls/useApiCalls'

interface FaqItem {
  question: string
  answer: string
}

interface UseFaqsProps {
  id?: number
  headline?: string
  service_id?: number
}

const faqCache = new Map<string, FaqItem[]>()
const pendingRequests = new Map<string, Promise<FaqItem[]>>()

export function useFaqs(props: UseFaqsProps = {}) {
  const { id, headline, service_id } = props
  const effectiveServiceId = service_id || id || 0
  const { getPublic } = useNonSecureCalls()

  const [faq, setFaq] = useState<FaqItem[]>([])

  const backgroundImage = `${process.env.NEXT_PUBLIC_MEDIA_URL ?? ''}/faq-background.png`

  const fetchFaqs = useCallback(async () => {
    const cacheKey = String(effectiveServiceId)

    if (faqCache.has(cacheKey)) {
      setFaq(faqCache.get(cacheKey)!)
      return
    }

    if (!pendingRequests.has(cacheKey)) {
      const params: Record<string, string | number> = effectiveServiceId ? { service_id: effectiveServiceId } : {}
      pendingRequests.set(
        cacheKey,
        getPublic<FaqItem[]>(NON_SECURE_ENDPOINTS.SERVICE_FAQ, params)
          .then(r => r ?? [])
      )
    }

    try {
      const result = await pendingRequests.get(cacheKey)!
      faqCache.set(cacheKey, result)
      setFaq(result)
    } catch (err) {
      pendingRequests.delete(cacheKey)
      console.error(err)
    }
  }, [effectiveServiceId, getPublic])

  useEffect(() => {
    fetchFaqs()
  }, [fetchFaqs])

  return {
    faq,
    backgroundImage,
    fetchFaqs,
    headline,
    id,
    service_id,
  }
}
