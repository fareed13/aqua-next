'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuth } from './useAuth'
import { useEvent } from './useEvent'
import { useNonSecureCalls, useSecureCalls, NON_SECURE_ENDPOINTS, SECURE_ENDPOINTS } from './apiCalls/useApiCalls'
import { getPublicAuthHeader } from '@/lib/utils/initializeSocket'
import { useTracking } from './useTracking'
import { arrangeUnitOfTime } from '@/lib/utils/unitOfTime'
import type { Service, ServicePlan, Location } from '@/types/api'
import { toast } from 'sonner'
import { parseApiError } from '@/lib/utils/parseApiError'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find(c => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=604800`
}

function getInterestedServicesCookie(): number[] {
  const raw = getCookie('interested_services')
  if (!raw) return []
  try { return JSON.parse(raw) } catch { return [] }
}

export function interestedServiceSetter(serviceId: number) {
  const current = getInterestedServicesCookie()
  const without = current.filter(id => id !== serviceId)
  setCookie('interested_services', JSON.stringify([...without, serviceId]))
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
  const { getPublic, postPublic, postPublicProtected } = useNonSecureCalls()
  const { postSecure } = useSecureCalls()
  const selectedEvent = useUiStore(s => s.selectedEvent)
  const selectedPlan = useUiStore(s => s.selectedPlan)
  const setSelectedPlanInStore = useUiStore(s => s.setSelectedPlan)
  const authToken = useUiStore(s => s.checkoutAuthToken)
  const setAuthToken = useUiStore(s => s.setCheckoutAuthToken)
  const checkoutCustomer = useUiStore(s => s.checkoutCustomer)
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
        // Prefer plan explicitly selected by user from UI; fall back to first by order
        const p: any = { ...(selectedPlan ?? first) }
        p.unit_of_time = arrangeUnitOfTime(p.amount_of_units as number, p.unit_of_time as string)
        setPlan(p)
      }
    } catch (err) { console.error(err) }
  }, [services, selectedPlan])

  const setPrice = useCallback(() => {
    if (selectedEvent) {
      const evtPrice = isStatusMember()
        ? parseFloat((selectedEvent as any).member_price ?? 0)
        : parseFloat((selectedEvent as any).price ?? 0)
      return evtPrice * quantity
    }
    return plan.discounted_price
      ? parseFloat(parseFloat(plan.discounted_price).toFixed(2) as string) * quantity * students.length
      : parseFloat(plan.price) * students.length * quantity
  }, [selectedEvent, isStatusMember, plan, quantity, students])

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

  const onLoadStripe = useCallback(async (locationOverride?: Location | null) => {
    const loc = locationOverride ?? selectedLocationObject
    destroyStripeElements()
    setStripeHasPublishableKey(false)
    setStripeCredsResolved(false)
    try {
      const response: any = await getPublic(NON_SECURE_ENDPOINTS.STRIPE_CREDS, {
        location_id: loc?.id,
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

  // Returns the resolved serviceId so callers can immediately pass it to getPlan
  const getPrimaryService = useCallback((explicitService?: { id: number; name: string } | null): number | null => {
    if (explicitService) {
      setSelectedClass(explicitService.name)
      setServiceId(explicitService.id)
      return explicitService.id
    }

    // Find admin-set default plan (is_default === true) across all services
    const defaultPlans: any[] = services.flatMap((s: any) =>
      (s.service_plans ?? [])
        .filter((sp: any) => sp.plan?.is_default === true)
        .map((sp: any) => ({ ...sp, service_name: s.name }))
    )
    const adminDefault = defaultPlans[0] ?? null
    setDefaultServicePlan(adminDefault)

    const filtered = servicesWithPlan()
    const firstService = filtered[0] ?? services[0]

    const cookie = getInterestedServicesCookie()

    if (cookie.length > 0) {
      // Last entry = most recently visited
      const lastId = cookie[cookie.length - 1]
      const found = services.find((s: any) => s.id === lastId)
      if (found) {
        setServiceId(lastId)
        setSelectedClass(found.name)
        return lastId
      }
    }

    // No cookie or cookie ID not in current services → use admin default or first service
    const id: number | null = adminDefault?.plan?.service ?? firstService?.id ?? null
    const name: string = adminDefault?.service_name ?? firstService?.name ?? ''
    setServiceId(id)
    setSelectedClass(name)
    if (adminDefault?.plan) setSelectedPlanInStore(adminDefault.plan)
    return id
  }, [services, servicesWithPlan, setSelectedPlanInStore])

  useEffect(() => {
    const filtered = servicesWithPlan()
    setFirstClass(filtered.map(s => s.name))
    setDefaultPlanIdAndDropdown()

    // URL ?service= takes highest priority
    const queryService = searchParams?.get('service')
    const urlMatch = queryService ? filtered.find(s => String(s.id) === queryService) : null
    const resolvedId = urlMatch ? (() => {
      setSelectedClass(urlMatch.name)
      setServiceId(urlMatch.id)
      return urlMatch.id
    })() : getPrimaryService()

    if (allLocations.length === 1) {
      setSelectedLocationObject(allLocations[0])
    }
    if (resolvedId) getPlan(resolvedId)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onLoadBraintree = useCallback(async (locationOverride?: Location | null) => {
    const loc = locationOverride ?? selectedLocationObject
    if (!loc) return
    removePreviousIframes()
    try {
      const response: any = await getPublic(NON_SECURE_ENDPOINTS.BRAINTREE_TOKEN, {
        location_id: loc.id,
      })
      const clientToken = response?.client_token
      if (!clientToken) return

      const loadScript = (src: string) =>
        new Promise<void>((res, rej) => {
          if (document.querySelector(`script[src="${src}"]`)) { res(); return }
          const s = document.createElement('script')
          s.src = src
          s.onload = () => res()
          s.onerror = () => rej(new Error(`Failed to load ${src}`))
          document.head.appendChild(s)
        })

      const v = '3.106.0'
      await loadScript(`https://js.braintreegateway.com/web/${v}/js/client.min.js`)
      await loadScript(`https://js.braintreegateway.com/web/${v}/js/hosted-fields.min.js`)
      await loadScript(`https://js.braintreegateway.com/web/${v}/js/three-d-secure.min.js`)

      const bt = (window as any).braintree
      const clientInstance = await bt.client.create({ authorization: clientToken })

      const hf = await bt.hostedFields.create({
        client: clientInstance,
        styles: {
          input: { 'font-size': '16px' },
          'input.invalid': { color: 'red' },
          'input.valid': { color: 'green' },
          '::placeholder': { color: '#aaa' },
        },
        fields: {
          number: { selector: '#card-number', placeholder: '' },
          cvv: { selector: '#cvv' },
          expirationDate: { selector: '#expiration-date', placeholder: 'MM/YY' },
        },
      })
      setHostedFieldsInstance(hf)

      const tds = await bt.threeDSecure.create({ version: 2, client: clientInstance })
      setThreeDSInstance(tds)
    } catch (err) {
      console.error('Braintree setup error:', err)
    }
  }, [selectedLocationObject, getPublic, removePreviousIframes])

  const onLoadSquare = useCallback(async (locationOverride?: Location | null) => {
    const loc = locationOverride ?? selectedLocationObject
    if (!loc) return
    try {
      const response: any = await getPublic(NON_SECURE_ENDPOINTS.SQUARE_TOKEN, {
        location_id: loc.id,
      })
      const { application_id, location_id, environment } = response ?? {}
      if (!application_id) return

      const initSquare = async () => {
        const formEl = document.getElementById('square-payment-form')
        if (!formEl) return
        const payments = (window as any).Square.payments(application_id, location_id)
        const card = await payments.card({
          style: {
            '.input-container': { borderColor: '#E0E2E3', borderRadius: '4px' },
            '.input-container.is-focus': { borderColor: '#4A90E2' },
            '.input-container.is-error': { borderColor: '#E53E3E' },
          },
        })
        await card.attach('#square-payment-form')
        setSquareCard(card)
        setSquarePayment(payments)
      }

      if (typeof window !== 'undefined') {
        if ((window as any).Square) {
          setTimeout(initSquare, 0)
        } else {
          const src =
            environment?.trim() === 'sandbox'
              ? 'https://sandbox.web.squarecdn.com/v1/square.js'
              : 'https://web.squarecdn.com/v1/square.js'
          const script = document.createElement('script')
          script.src = src
          script.onload = () => { if ((window as any).Square) initSquare() }
          document.head.appendChild(script)
        }
      }
    } catch (err) {
      console.error('Square setup error:', err)
    }
  }, [selectedLocationObject, getPublic])

  const handleVerifyStripe = useCallback(async (changeStep: (n: number) => void) => {
    if (!stripeHasPublishableKey || !stripeInstance || !stripeCardElement) return
    try {
      setLoading(true)
      const { paymentMethod, error } = await stripeInstance.createPaymentMethod({
        type: 'card',
        card: stripeCardElement,
      })
      if (error) { setLoading(false); console.error(error.message); return }
      setStripePaymentMethodId(paymentMethod.id)
      await sendPayment(changeStep, paymentMethod.id, null, null, null)
    } catch (err) {
      setLoading(false)
      console.error('Stripe tokenization error:', err)
    }
  }, [stripeHasPublishableKey, stripeInstance, stripeCardElement])

  const handleVerifyBraintree = useCallback(async (changeStep: (n: number) => void) => {
    if (!hostedFieldsInstance) return
    try {
      const state = hostedFieldsInstance.getState()
      if (!state.fields.number.isValid || !state.fields.cvv.isValid) {
        console.error('Invalid card number or CVV')
        return
      }
      const payload = await hostedFieldsInstance.tokenize()
      setThreeDSOverlay(true)
      const verification = await threeDSInstance.verifyCard({
        amount: setPrice(),
        nonce: payload.nonce,
        bin: payload.details.bin,
        challengeRequested: true,
        addFrame: (_err: any, iframe: HTMLIFrameElement) => {
          const container = document.createElement('div')
          container.id = 'bt-3ds-frame'
          container.appendChild(iframe)
          document.body.appendChild(container)
          setThreeDSOverlay(false)
        },
        removeFrame: () => {
          const el = document.getElementById('bt-3ds-frame')
          if (el) document.body.removeChild(el)
        },
        onLookupComplete: (_data: any, next: () => void) => next(),
      })
      setThreeDSOverlay(false)
      if (verification.liabilityShifted) {
        setVerifiedNonce(verification.nonce)
        setLoading(true)
        await sendPayment(changeStep, null, verification.nonce, null, null)
      } else {
        setVerifiedNonce(null)
        console.error('Braintree 3DS verification failed')
      }
    } catch (err) {
      setThreeDSOverlay(false)
      console.error('Braintree verification failed:', err)
    }
  }, [hostedFieldsInstance, threeDSInstance, setPrice])

  const handleVerifySquare = useCallback(async (changeStep: (n: number) => void) => {
    if (!squareCard) { console.error('Square payment not initialized'); return }
    try {
      setLoading(true)
      const result = await squareCard.tokenize()
      if (result.status !== 'OK') throw new Error(result.errors?.[0]?.detail ?? 'Square payment failed')
      // Extract expiry from Square result synchronously — React state (setForm) batches
      // updates and won't be readable by sendPayment's closure in the same tick.
      const { expMonth, expYear } = result.details?.card ?? {}
      const expMonthStr = expMonth ? String(expMonth) : form.card_expiration_month
      const expYearStr = expYear ? String(expYear) : form.card_expiration_year
      if (expMonth) setForm((p: any) => ({ ...p, card_expiration_month: expMonthStr }))
      if (expYear) setForm((p: any) => ({ ...p, card_expiration_year: expYearStr }))

      const allLocations = useOrgStore.getState().locations
      const verificationDetails = {
        amount: String(setPrice()),
        currencyCode: allLocations[0]?.state_acronym ?? 'USD',
        intent: 'CHARGE',
        billingContact: {
          familyName: form.last_name,
          givenName: form.first_name,
          email: form.email,
          country: (allLocations[0]?.state_acronym ?? 'US').slice(0, 2),
        },
      }
      const verificationResult = await squarePayment.verifyBuyer(result.token, verificationDetails)
      setSquarePaymentToken(result.token)
      setSquareVerificationToken(verificationResult.token)
      await sendPayment(changeStep, null, null, result.token, verificationResult.token, expMonthStr, expYearStr)
    } catch (err) {
      setLoading(false)
      console.error('Square payment failed:', err)
    }
  }, [squareCard, squarePayment, form, setPrice])

  const sendPayment = useCallback(async (
    changeStep: (n: number) => void,
    overrideStripeId?: string | null,
    overrideNonce?: string | null,
    overrideSquareToken?: string | null,
    overrideSquareVerification?: string | null,
    overrideExpMonth?: string | null,
    overrideExpYear?: string | null,
  ) => {
    setLoading(true)
    const org = organization!
    const method = selectedLocationObject?.active_payment_method
    const isBookingEnabled = org.is_booking_enabled
    const evtId = (selectedEvent as any)?.id ?? null

    const cleanPhone = (p: string) => p.replace(/[() -]/g, '')

    // form/students are local to this hook instance; fall back to shared store values
    // that were populated by completeStep1 in Checkout.tsx (a different hook instance)
    const resolvedEmail = form.email || checkoutCustomer?.email || ''
    const resolvedPhone = cleanPhone(form.phone || checkoutCustomer?.phone || '')
    const resolvedStudents = students.length && students[0].first_name
      ? students
      : checkoutCustomer
        ? [{ first_name: checkoutCustomer.firstName, last_name: checkoutCustomer.lastName }]
        : students

    let data: Record<string, unknown> = evtId
      ? {
          students: resolvedStudents,
          price: setPrice(),
          quantity,
          email: resolvedEmail,
          phone: resolvedPhone,
          location_id: selectedLocationObject?.id,
          event_id: evtId,
          utm_variables: getTrackingPayload(),
        }
      : {
          students: resolvedStudents,
          price: setPrice(),
          email: resolvedEmail,
          phone: resolvedPhone,
          plan_id: plan?.id,
          quantity,
          location_id: selectedLocationObject?.id,
          service_type: selectedClass,
          event_id: null,
          utm_variables: getTrackingPayload(),
        }

    if (method === 'stripe') {
      const sid = overrideStripeId ?? stripePaymentMethodId
      if (stripeHasPublishableKey && sid) {
        data.stripe_payment_method_id = sid
      } else {
        data.credit_card = (form.credit_card ?? '').replace(/ /g, '')
        data.card_expiration_year = Number(form.card_expiration_year) - 2000
        data.card_expiration_month = form.card_expiration_month
        data.card_cvv_code = form.card_cvv_code
      }
    }
    if (method === 'braintree') {
      const nonce = overrideNonce ?? verifiedNonce
      data.braintree_token = nonce
      data.deviceData = deviceData
      data.card_expiration_month = form.card_expiration_month
      data.card_expiration_year = form.card_expiration_year
      data.card_cvv_code = form.card_cvv_code
    }
    if (method === 'fat_zebra') {
      data.card_holder = form.card_holder
      data.credit_card = (form.credit_card ?? '').replace(/ /g, '')
      data.card_expiration_year = form.card_expiration_year
      data.card_expiration_month = form.card_expiration_month
      data.card_cvv_code = form.card_cvv_code
    }
    if (method === 'aquila') {
      data.credit_card = (form.credit_card ?? '').replace(/ /g, '')
      data.card_expiration_year = form.card_expiration_year
      data.card_expiration_month = form.card_expiration_month
      data.city = city
      data.street = street
      data.zip_code = zipCode
      data.state = state
    }
    if (method === 'square') {
      const sqToken = overrideSquareToken ?? squarePaymentToken
      const sqVerif = overrideSquareVerification ?? squareVerificationToken
      data.card_expiration_year = overrideExpYear ?? form.card_expiration_year
      data.card_expiration_month = overrideExpMonth ?? form.card_expiration_month
      data.card_token = sqToken
      data.verification_token = sqVerif
    }

    try {
      if (!method) throw new Error('No active payment method configured')

      // For recaptcha orgs: always read fresh from sessionStorage so a renewed token
      // (user re-verified after expiry) is picked up automatically.
      // For non-recaptcha orgs: use the cached websocket token to avoid a new connection.
      const authHeader = org.recaptcha_enabled
        ? (sessionStorage.getItem('recaptcha_token') ?? '')
        : (authToken || await getPublicAuthHeader(org.id, false))

      if (evtId) {
        if (isStatusMember()) {
          await postSecure(SECURE_ENDPOINTS.EVENT_PURCHASE, data)
        } else {
          await postPublicProtected(NON_SECURE_ENDPOINTS.EVENT_PURCHASE, data, authHeader)
        }
        toast.success('Payment confirmed')
        changeStep(4)
      } else {
        await postPublicProtected(NON_SECURE_ENDPOINTS.CUSTOMER_PURCHASE, data, authHeader)
        toast.success('Payment confirmed')
        changeStep(isBookingEnabled ? 3 : 4)
      }
    } catch (err) {
      console.error('Purchase failed:', err)
      toast.error(parseApiError(err))
      if (method === 'stripe' && stripeHasPublishableKey) {
        setStripePaymentMethodId(null)
      }
    } finally {
      setLoading(false)
    }
  }, [
    organization, selectedLocationObject, selectedEvent, selectedPlan,
    students, form, plan, quantity, selectedClass,
    stripeHasPublishableKey, stripePaymentMethodId, verifiedNonce, deviceData,
    squarePaymentToken, squareVerificationToken,
    city, street, zipCode, state, authToken, checkoutCustomer,
    isStatusMember, postSecure, postPublicProtected, getTrackingPayload, setPrice,
  ])

  const validate = useCallback(async (changeStep: (n: number) => void) => {
    const method = selectedLocationObject?.active_payment_method
    if (!method) { console.error('No payment method'); return }

    if (method === 'braintree') {
      await handleVerifyBraintree(changeStep)
    } else if (method === 'square') {
      await handleVerifySquare(changeStep)
    } else if (method === 'stripe') {
      if (!stripeCredsResolved) { console.error('Payment form still loading'); return }
      if (stripeHasPublishableKey) {
        await handleVerifyStripe(changeStep)
      } else {
        setLoading(true)
        await sendPayment(changeStep)
      }
    } else {
      setLoading(true)
      await sendPayment(changeStep)
    }
  }, [
    selectedLocationObject, stripeCredsResolved, stripeHasPublishableKey,
    handleVerifyBraintree, handleVerifySquare, handleVerifyStripe, sendPayment,
  ])

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
    onLoadBraintree, onLoadSquare,
    validate, sendPayment,
    authToken, setAuthToken,
    getState, findNearestLocation, getLocationCoordinates,
    getFirstServicePlanByOrder, getPrimaryService,
    getTrackingPayload,
    arrangeUnitOfTime,
    selectedEvent, selectedPlan,
  }
}
