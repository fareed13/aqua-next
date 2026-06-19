'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSecureCalls, SECURE_ENDPOINTS } from './apiCalls/useApiCalls'

interface CommunicationRecord {
  id: number
  type: 'email' | 'sms'
  created_at: string
  sent_by_location?: boolean
  contact?: {
    id: number
    first_name?: string
    last_name?: string
  }
  [key: string]: unknown
}

interface FormattedRecord extends CommunicationRecord {
  full_name: string
}

export function useCommunication() {
  const router = useRouter()
  const { getSecure } = useSecureCalls()

  const [fromLocation, setFromLocation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [allSms, setAllSms] = useState<CommunicationRecord[]>([])
  const [allEmail, setAllEmail] = useState<CommunicationRecord[]>([])

  const filteredSms = useMemo((): FormattedRecord[] => {
    let result = [...allSms]
    if (fromLocation) {
      result = result.filter(d => d.sent_by_location)
    }
    return result.map(el => ({
      ...el,
      full_name: `${el.contact?.first_name ?? ''} ${el.contact?.last_name ?? ''}`.trim(),
    }))
  }, [allSms, fromLocation])

  const filteredEmail = useMemo((): FormattedRecord[] => {
    let result = [...allEmail]
    if (fromLocation) {
      result = result.filter(d => d.sent_by_location)
    }
    return result.map(el => ({
      ...el,
      full_name: `${el.contact?.first_name ?? ''} ${el.contact?.last_name ?? ''}`.trim(),
    }))
  }, [allEmail, fromLocation])

  const fetchCommunication = useCallback(async () => {
    try {
      setLoading(true)
      const communication: CommunicationRecord[] =
        (await getSecure<CommunicationRecord[]>(SECURE_ENDPOINTS.COMMUNICATION, {})) ?? []

      setAllEmail(
        communication
          .filter(c => c.type === 'email')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      )
      setAllSms(
        communication
          .filter(c => c.type === 'sms')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      )
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [getSecure])

  useEffect(() => {
    fetchCommunication()
  }, [fetchCommunication])

  const clickOnRow = useCallback(
    (data: CommunicationRecord) => {
      if (data.contact?.id) {
        router.push(`/customers/${data.contact.id}?communication=1&type=${data.type}`)
      }
    },
    [router]
  )

  return {
    fromLocation,
    setFromLocation,
    loading,
    allSms,
    allEmail,
    filteredSms,
    filteredEmail,
    clickOnRow,
    fetchCommunication,
  }
}
