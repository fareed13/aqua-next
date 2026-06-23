'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from './useAuth'
import { useEvent } from './useEvent'
import { useNonSecureCalls, useSecureCalls, NON_SECURE_ENDPOINTS, SECURE_ENDPOINTS } from './apiCalls/useApiCalls'
import { useTracking } from './useTracking'
import { arrangeUnitOfTime } from '@/lib/utils/unitOfTime'
import type { Service, ServicePlan, Location } from '@/types/api'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find(c => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=604800`
}

interface CheckoutForm {
  first_name: string; last_name: string; card_holder: string
  email: string; phone: string; credit_card: string | null
  card_expiration_year: string; card_expiration_month: string; card_cvv_code: string
}

interface Student { first_name: string; last_name: string }

const DAYS_OF_WEEK = [
  { display: 'MON', value: 'monday' }, { display: 'TUE', value: 'tuesday' },
  { display: 'WED', value: 'wednesday' }, { display: 'THU', value: 'thursday' },
  { display: 'FRI', value: 'friday' }, { display: 'SAT', value: 'saturday' },
  { display: 'SUN', value: 'sunday' },
]

export function useCheckoutDetails() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const organization = useOrgStore(s => s.organization)
  const allLocations = useOrgStore(s => s.locations)
  const services = organization?.services ?? []
  const { isStatusMember } = useAuth()
  const { arrangeEventPrice } = useEvent()
  const { getPublic, postPublic } = useNonSecureCalls()
  const { postSecure } = useSecureCalls()
  const { getTrackingPayload } = useTracking()

  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [states, setStates] = useState<unknown[]>([])
  const [selectedClass, setSelectedClass] = useState('')
  const [serviceId, setServiceId] = useState<number | null>(null)
  const [plan, setPlan] = useState<any>({})
  const [firstClass, setFirstClass] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [locationLoader, setLocationLoader] = useState(false)
  const [students, setStudents] = useState<Student[]>([{ first_name: '', last_name: '' }])
  const [form, setForm] = useState<CheckoutForm>({
    first_name: '', last_name: '', card_holder: '',
    email: '', phone: '', credit_card: null,
    card_expiration_year: '', card_expiration_month: '', card_cvv_code: '',
  })
  const [selectedLocationObject, setSelectedLocationObject] = useState<Location | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [dropdownPlans, setDropdownPlans] = useState<ServicePlan[]>([])
  const [defaultPlanId, setDefaultPlanId] = useState<number | null>(null)
  const [defaultPlan, setDefaultPlan] = useState<ServicePlan | null>(null)
  const [defaultServicePlan, setDefaultServicePlan] = useState<any>(null)

  const [hostedFieldsInstance, setHostedFieldsInstance] = useState<any>(null)
  const [threeDSInstance, setThreeDSInstance] = useState<any>(null)
  const [verifiedNonce, setVerifiedNonce] = useState<string | null>(null)
  const [threeDSOverlay, setThreeDSOverlay] = useState(false)
  const [deviceData, setDeviceData] = useState<any>(null)
  const [squareCard, setSquareCard] = useState<any>(null)
  const [squarePayment, setSquarePayment] = useState<any>(null)
  const [squarePaymentToken, setSquarePaymentToken] = useState<string | null>(null)
  const [squareVerificationToken, setSquareVerificationToken] = useState<string | null>(null)

  const [stripeInstance, setStripeInstance] = useState<any>(null)
  const [stripeCardElement, setStripeCardElement] = useState<any>(null)
  const [stripePaymentMethodId, setStripePaymentMethodId] = useState<string | null>(null)
  const [stripeCardComplete, setStripeCardComplete] = useState(false)
  const [stripeElementError, setStripeElementError] = useState<string | null>(null)
  const [stripeHasPublishableKey, setStripeHasPublishableKey] = useState(false)
  const [stripeCredsResolved, setStripeCredsResolved] = useState(false)

  const computedSm = pathname?.includes('/checkout') ? 4 : 12

  const servicesWithPlan = useCallback((): Service[] => {
    return services
      .map(service => {
        const paidPlans = service.service_plans?.filter(sp => {
          const price = sp.plan.discounted_price !== null
            ? parseFloat(sp.plan.discounted_price) : parseFloat(sp.plan.price)
          return price > 0
        }) ?? []
        if (paidPlans.length > 0) return { ...service, service_plans: paidPlans }
        return null
      })
      .filter((s): s is Service => s !== null)
  }, [services])

  const servicesWithAllFreePlan = useCallback(() => {
    return services.filter(s => s.service_plans.length > 0)
  }, [services])

  const setDefaultPlanIdAndDropdown = useCallback(() => {
    const plansArray = servicesWithAllFreePlan().flatMap(s => s.service_plans)
    const dp = plansArray.find(p => p.plan.is_default)
    if (dp?.plan?.id) {
      setDefaultPlanId(dp.plan.id)
      setDefaultPlan(dp)
    }
    setDropdownPlans([...plansArray])
  }, [servicesWithAllFreePlan])

  const getPlan = useCallback((id: number | null) => {
    if (!id) return
    try {
      const targetedService = services.find(s => s.id === id)
      if (!targetedService) return
      const sps = targetedService.service_plans ?? []
      if (sps.length > 0) {
        const sorted = [...sps].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        const first = sorted[0]?.plan ?? sorted[0]
        const p = { ...first }
        p.unit_of_time = arrangeUnitOfTime(p.amount_of_units, p.unit_of_time)
        setPlan(p)
      }
    } catch (err) { console.error(err) }
  }, [services])

  const setPrice = useCallback(() => {
    return plan.discounted_price
      ? parseFloat(parseFloat(plan.discounted_price).toFixed(2) as string) * quantity * students.length
      : parseFloat(plan.price) * students.length * quantity
  }, [plan, quantity, students])

  const removePreviousIframes = useCallback(() => {
    ;['card-number', 'cvv', 'expiration-date'].forEach(id => {
      const el = document.getElementById(id)
      if (el) el.innerHTML = ''
    })
  }, [])

  const destroyStripeElements = useCallback(() => {
    if (stripeCardElement) {
      stripeCardElement.unmount()
      stripeCardElement.destroy()
    }
    setStripeCardElement(null)
    setStripeInstance(null)
    setStripePaymentMethodId(null)
    setStripeCardComplete(false)
    setStripeElementError(null)
  }, [stripeCardElement])

  const onLoadStripe = useCallback(async () => {
    destroyStripeElements()
    setStripeHasPublishableKey(false)
    setStripeCredsResolved(false)
    try {
      const response: any = await getPublic(NON_SECURE_ENDPOINTS.STRIPE_CREDS, {
        location_id: selectedLocationObject?.id,
      })
      const publishableKey = response?.publishable_key
      if (!publishableKey || !String(publishableKey).trim().length) {
        setStripeCredsResolved(true)
        return
      }
      setStripeHasPublishableKey(true)
      if (typeof window !== 'undefined') {
        const initElements = (stripe: any) => {
          setStripeInstance(stripe)
          setTimeout(() => {
            const elements = stripe.elements()
            const card = elements.create('card', {
              style: {
                base: { fontSize: '16px', color: '#32325d', '::placeholder': { color: '#aab7c4' } },
                invalid: { color: '#fa755a', iconColor: '#fa755a' },
              },
            })
            card.mount('#stripe-card-element')
            card.on('change', (event: any) => {
              setStripeCardComplete(event.complete && !event.error)
              setStripeElementError(event.error?.message ?? null)
            })
            setStripeCardElement(card)
            setStripeCredsResolved(true)
          }, 0)
        }
        if ((window as any).Stripe) {
          initElements((window as any).Stripe(publishableKey))
        } else {
          const script = document.createElement('script')
          script.src = 'https://js.stripe.com/v3/'
          script.onload = () => initElements((window as any).Stripe(publishableKey))
          script.onerror = () => { setStripeHasPublishableKey(false); setStripeCredsResolved(true) }
          document.head.appendChild(script)
        }
      }
    } catch { setStripeHasPublishableKey(false); setStripeCredsResolved(true) }
  }, [destroyStripeElements, getPublic, selectedLocationObject])

  const incrementQuantity = useCallback(() => setQuantity(q => q + 1), [])
  const decrementQuantity = useCallback(() => setQuantity(q => Math.max(1, q - 1)), [])

  const getState = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getPublic<unknown[]>(NON_SECURE_ENDPOINTS.PUBLIC_STATE, { country: 'US' })
      setStates(response ?? [])
    } catch (error) { console.error(error) }
    finally { setLoading(false) }
  }, [getPublic])

  const findNearestLocation = useCallback(async (position: GeolocationPosition) => {
    try {
      setLocationLoader(true)
      const locationData = {
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      }
      const sorted: any = await postPublic(NON_SECURE_ENDPOINTS.NEAREST_LOCATION_FINDER, locationData)
      if (sorted?.[0]) {
        setSelectedLocationObject(allLocations.find(loc => loc.id === sorted[0].id) ?? null)
      }
    } catch { /* ignore */ }
    finally { setLocationLoader(false) }
  }, [postPublic, allLocations])

  const getLocationCoordinates = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(findNearestLocation, () => {})
    }
  }, [findNearestLocation])

  const getFirstServicePlanByOrder = useCallback((service: Service) => {
    if (!service?.service_plans?.length) return null
    return [...service.service_plans].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))[0]
  }, [])

  useEffect(() => {
    const filtered = servicesWithPlan()
    const classNames: string[] = []
    let initialServiceId: number | null = null
    let initialClass = ''

    const cookieStr = getCookie('interested_services')
    const interestedIds: number[] = cookieStr ? JSON.parse(cookieStr) : []

    filtered.forEach((element, index) => {
      if (index === 0) { initialClass = element.name; initialServiceId = element.id }
      classNames.push(element.name)
      if (interestedIds.includes(element.id)) { initialClass = element.name; initialServiceId = element.id }
      const queryService = searchParams?.get('service')
      if (queryService === String(element.id)) { initialClass = element.name; initialServiceId = element.id }
    })

    setFirstClass(classNames)
    setSelectedClass(initialClass)
    setServiceId(initialServiceId)
    setDefaultPlanIdAndDropdown()

    if (allLocations.length === 1) {
      setSelectedLocationObject(allLocations[0])
    }
    if (initialServiceId) getPlan(initialServiceId)
  }, [])

  return {
    organization, allLocations, services,
    computedSm, arrangeEventPrice,
    street, setStreet, city, setCity, state, setState, zipCode, setZipCode, states,
    selectedClass, setSelectedClass, serviceId, setServiceId,
    plan, setPlan, firstClass, loading, setLoading, locationLoader,
    students, setStudents, form, setForm,
    selectedLocationObject, setSelectedLocationObject,
    quantity, incrementQuantity, decrementQuantity,
    dropdownPlans, defaultPlanId, defaultPlan, defaultServicePlan,
    hostedFieldsInstance, setHostedFieldsInstance,
    threeDSInstance, setThreeDSInstance,
    verifiedNonce, setVerifiedNonce,
    threeDSOverlay, setThreeDSOverlay,
    deviceData, setDeviceData,
    squareCard, setSquareCard, squarePayment, setSquarePayment,
    squarePaymentToken, setSquarePaymentToken,
    squareVerificationToken, setSquareVerificationToken,
    stripeInstance, stripeCardElement,
    stripePaymentMethodId, setStripePaymentMethodId,
    stripeCardComplete, stripeElementError,
    stripeHasPublishableKey, stripeCredsResolved,
    servicesWithPlan, servicesWithAllFreePlan,
    setDefaultPlanIdAndDropdown, getPlan, setPrice,
    removePreviousIframes, destroyStripeElements, onLoadStripe,
    getState, findNearestLocation, getLocationCoordinates,
    getFirstServicePlanByOrder,
    getTrackingPayload,
    arrangeUnitOfTime,
  }
}
