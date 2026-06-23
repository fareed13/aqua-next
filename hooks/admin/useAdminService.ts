'use client'

import { useState, useCallback } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '../apiCalls/useApiCalls'

export function useAdminService() {
  const { getSecure, postSecure, putSecure, deleteSecure } = useSecureCalls()

  const [topics, setTopics] = useState<unknown[]>([])
  const [selectedTopics, setSelectedTopics] = useState<unknown[]>([])
  const [serviceTypes, setServiceTypes] = useState<unknown[]>([])
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<unknown[]>([])
  const [allServiceIntro, setAllServiceIntro] = useState<unknown[]>([])
  const [serviceIntro, setServiceIntro] = useState<unknown | null>(null)

  const fetchOrganizationServices = useCallback(
    () => getSecure(SECURE_ENDPOINTS.GET_SERVICES),
    [getSecure]
  )

  const fetchServiceById = useCallback(
    (id: number) => getSecure(SECURE_ENDPOINTS.GET_SERVICES, { id }),
    [getSecure]
  )

  const fetchServiceIntro = useCallback(async () => {
    const result = await getSecure<unknown[]>(SECURE_ENDPOINTS.SERVICE_INTRO)
    setAllServiceIntro(result ?? [])
  }, [getSecure])

  const fetchTopics = useCallback(async () => {
    const result = await getSecure<unknown[]>(SECURE_ENDPOINTS.SERVICE_TOPIC)
    setTopics(result ?? [])
  }, [getSecure])

  const fetchServiceTypes = useCallback(async () => {
    const result = await getSecure<unknown[]>(SECURE_ENDPOINTS.SERVICE_TYPE)
    setServiceTypes(result ?? [])
  }, [getSecure])

  const adminUpdateService = useCallback(
    (updateObj: unknown) => putSecure(SECURE_ENDPOINTS.GET_SERVICES, updateObj),
    [putSecure]
  )

  const adminCreateService = useCallback(
    (createObj: unknown) => postSecure(SECURE_ENDPOINTS.GET_SERVICES, createObj),
    [postSecure]
  )

  const adminDeleteService = useCallback(
    async (id: number) => {
      const resp = await fetchServiceById(id) as unknown[]
      if (!resp?.[0]) {
        throw new Error('This service is already deleted')
      }
      return deleteSecure(SECURE_ENDPOINTS.GET_SERVICES, id)
    },
    [fetchServiceById, deleteSecure]
  )

  const adminUpdateServiceOrder = useCallback(
    (updateObject: unknown) => putSecure(SECURE_ENDPOINTS.SERVICE_BULK, updateObject),
    [putSecure]
  )

  const guidedFlowCreateProgram = useCallback(
    (createObj: unknown) => postSecure(SECURE_ENDPOINTS.SERVICE_GUIDED_FLOW, createObj),
    [postSecure]
  )

  return {
    topics, setTopics, selectedTopics, setSelectedTopics,
    serviceTypes, setServiceTypes, selectedServiceTypes, setSelectedServiceTypes,
    allServiceIntro, serviceIntro, setServiceIntro,
    fetchOrganizationServices, fetchServiceById, fetchServiceIntro,
    fetchTopics, fetchServiceTypes,
    adminUpdateService, adminCreateService, adminDeleteService,
    adminUpdateServiceOrder, guidedFlowCreateProgram,
  }
}
