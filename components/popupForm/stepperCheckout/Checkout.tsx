'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useCheckoutDetails } from '@/hooks/useCheckoutDetails'
import { getPublicAuthHeader } from '@/lib/utils/initializeSocket'
import { useNonSecureCalls, NON_SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useRecaptcha } from '@/hooks/useRecaptcha'
// import { useValidation } from '@/hooks/useValidation'
import { toast } from 'sonner'
import { parseApiError } from '@/lib/utils/parseApiError'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const AppointmentBooking = dynamic(
  () => import('./AppointmentBooking').then((m) => m.AppointmentBooking),
  { ssr: false }
)
const CheckoutStep2 = dynamic(
  () => import('./CheckoutStep2').then((m) => m.CheckoutStep2),
  { ssr: false }
)
const EventPurchaseStep = dynamic(
  () => import('./EventPurchaseStep').then((m) => m.EventPurchaseStep),
  { ssr: false }
)
const ChatContainer = dynamic(
  () => import('@/components/chatBotModel/ChatContainer').then((m) => m.ChatContainer),
  { ssr: false }
)

export function Checkout() {
  const router = useRouter()
  const pathname = usePathname()

  const organization = useOrgStore((s) => s.organization)
  const locations = useOrgStore((s) => s.locations)
  const primaryLocation = useOrgStore((s) => s.location)
  const dialog = useUiStore((s) => s.dialog)
  const setDialog = useUiStore((s) => s.setDialog)
  const selectedEvent = useUiStore((s) => s.selectedEvent)
  const setCheckoutCustomer = useUiStore((s) => s.setCheckoutCustomer)

  const {
    servicesWithPlan,
    getFirstServicePlanByOrder,
    getPlan,
    getLocationCoordinates,
    form,
    setForm,
    setStudents,
    selectedLocationObject,
    setSelectedLocationObject,
    serviceId,
    students,
    selectedClass,
    setAuthToken,
  } = useCheckoutDetails()

  const { postPublic, postPublicProtected } = useNonSecureCalls()
  const { recaptchaReady, loadRecaptchaScript, getSiteKey } = useRecaptcha()

  // Step state
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState<number>(2089)
  const [plansWithServices, setPlansWithServices] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'form' | 'chatbot'>('form')
  const [recaptchaVerified, setRecaptchaVerified] = useState(false)
  const captchaWidgetId = useRef<number | null>(null)

  // Form fields
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [contactTime, setContactTime] = useState('')
  const [smsOptIn, setSmsOptIn] = useState(false)
  const [customField, setCustomField] = useState('')
  const [reasonForJoining, setReasonForJoining] = useState('')

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isUk = useMemo(() => {
    const st = primaryLocation?.state
    if (!st?.name) return false
    const name = st.name.toLowerCase()
    return name === 'united kingdom' || st.parent_state?.name?.toLowerCase() === 'united kingdom'
  }, [primaryLocation])
  const isAustralia = useMemo(() => {
    const st = primaryLocation?.state
    if (!st?.name) return false
    const name = st.name.toLowerCase()
    return name === 'australia' || st.parent_state?.name?.toLowerCase() === 'australia'
  }, [primaryLocation])
  const isNewZealand = useMemo(() => {
    const st = primaryLocation?.state
    if (!st?.name) return false
    const name = st.name.toLowerCase()
    return name === 'new zealand' || st.parent_state?.name?.toLowerCase() === 'new zealand'
  }, [primaryLocation])

  const handlePhoneChange = useCallback((raw: string) => {
    if (isUk) {
      setMobile(raw.replace(/\D/g, '').slice(0, 11))
    } else if (isAustralia || isNewZealand) {
      setMobile(raw.replace(/\D/g, '').slice(0, 10))
    } else {
      // US: format as (###)-###-####
      const digits = raw.replace(/\D/g, '').slice(0, 10)
      if (!digits) { setMobile(''); return }
      let formatted = `(${digits.slice(0, 3)}`
      if (digits.length > 3) formatted += `)-${digits.slice(3, 6)}`
      if (digits.length > 6) formatted += `-${digits.slice(6)}`
      setMobile(formatted)
    }
  }, [isUk, isAustralia, isNewZealand])

  const accentColor =
    organization?.colors?.['app-main-accent-color'] ?? '#1976D2'

  const arrangedProgress = useMemo(() => {
    return Math.ceil((50 / 3) * ((step === 0 ? 1 : step) - 1)) + 50
  }, [step])

  const isOnCheckoutPage = pathname?.includes('/checkout')

  // ------- location helpers -------
  const locationLabel = (loc: any) =>
    loc?.target_locations?.length > 0 ? loc.target_locations[0] : loc?.city

  const locationChanged = useCallback(() => {
    getPlan(serviceId)
  }, [getPlan, serviceId])

  // ------- step navigation -------
  const changeStep = useCallback(
    (i: number) => {
      setStep(i)
      if (
        i === 4 &&
        organization?.is_thanks_redirect_enabled
      ) {
        setDialog(false)
        router.push('/thank-you')
        setStep(1)
      }
    },
    [organization, setDialog, router]
  )

  const closeDialogue = useCallback(() => {
    if (isOnCheckoutPage) {
      router.push('/')
    } else {
      changeStep(1)
      setDialog(false)
    }
  }, [isOnCheckoutPage, router, changeStep, setDialog])

  const scrollToTop = () => {
    const el = document.getElementById('stepperId')
    el?.scrollIntoView({ behavior: 'auto', block: 'start' })
  }

  // ------- form validation -------
  const validateStep1 = async () => {
    // Honeypot check
    if (contactTime.trim() !== '') return

    const newErrors: Record<string, string> = {}

    if (!firstname.trim()) newErrors.firstname = 'First name is required'
    else if (firstname.trim().length > 100) newErrors.firstname = 'First name must be under 100 characters'

    if (!lastname.trim()) newErrors.lastname = 'Last name is required'
    else if (lastname.trim().length > 100) newErrors.lastname = 'Last name must be under 100 characters'

    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email'
    else if (email.trim().length > 100) newErrors.email = 'Email must be under 100 characters'

    if (isUk) {
      if (!mobile.trim()) {
        newErrors.mobile = 'Phone number is required'
      } else {
        const digits = mobile.replace(/\D/g, '')
        if (digits.length < 10 || digits.length > 11)
          newErrors.mobile = 'Phone number must be 10–11 digits'
      }
    } else if (isAustralia || isNewZealand) {
      if (mobile.trim()) {
        const digits = mobile.replace(/\D/g, '')
        if (digits.length < 9 || digits.length > 10)
          newErrors.mobile = 'Phone number must be 9–10 digits'
      }
    } else {
      // US: optional, if filled must be 14 chars (###)-###-####
      if (mobile.trim() && mobile.replace(/\D/g, '').length > 0 && mobile.length < 14)
        newErrors.mobile = 'Please enter a valid phone number'
    }

    if (locations.length > 1 && !selectedLocationObject?.id)
      newErrors.location = 'Please select a location'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    await completeStep1()
  }

  const completeStep1 = async () => {
    const tags: string[] = pathname === '/' ? ['general'] : selectedEvent ? ['event'] : [pathname.replace('/', '')]

    try {
      setLoading(true)
      const org = organization!
      const authHeader = await getPublicAuthHeader(org.id, !!org.recaptcha_enabled)
      setAuthToken(authHeader)

      const result: any = await postPublicProtected(
        NON_SECURE_ENDPOINTS.CUSTOMER_CREATE,
        {
          first_name: firstname,
          last_name: lastname,
          email,
          phone: mobile,
          location_id: selectedLocationObject?.id,
          service: serviceId,
          tags,
          is_uk: isUk,
          sms_opt_in: smsOptIn,
          custom_field: customField || undefined,
          reason_for_joining: reasonForJoining || undefined,
        },
        authHeader,
      )

      const newCustomerId: number = result?.id ?? customerId
      setCustomerId(newCustomerId)

      // Sync form state into the hook so send() can use it
      setForm((prev: any) => ({ ...prev, email, phone: mobile }))
      setStudents([{ first_name: firstname, last_name: lastname }])
      // Share customer data globally so other hook instances (step 2/3) can read it
      setCheckoutCustomer({ email, phone: mobile, firstName: firstname, lastName: lastname })

      const is_booking_enabled = org.is_booking_enabled
      const selectedPlan = useUiStore.getState().selectedPlan

      // --- Free event ---
      if (selectedEvent && selectedEvent.id) {
        const eventPrice = parseFloat((selectedEvent as any).price ?? '0')
        if (!eventPrice) {
          await postPublicProtected(
            NON_SECURE_ENDPOINTS.FREE_EVENT_TRACK,
            { price_charged: (selectedEvent as any).price, customer: newCustomerId, event: selectedEvent.id },
            authHeader,
          )
          changeStep(4)
          return
        }
      }

      // Fall back to first service-with-paid-plan when serviceId hasn't been resolved yet
      const currentServicesWithPlan = servicesWithPlan()
      const effectiveServiceId = serviceId ?? currentServicesWithPlan[0]?.id ?? null
      const targeted_service = org.services?.find((s: any) => s.id === effectiveServiceId)
      const firstServicePlanByOrder = getFirstServicePlanByOrder(targeted_service as any)
      const firstPlanByOrder = firstServicePlanByOrder?.plan

      // --- No service plans ---
      if (!selectedPlan && !targeted_service?.service_plans?.length && !selectedEvent) {
        changeStep(is_booking_enabled ? 3 : 4)
        return
      }

      // --- Free plan ---
      if (!selectedEvent) {
        const effectivePlan: any = selectedPlan ?? firstPlanByOrder
        if (effectivePlan && (effectivePlan.price === '0.00' || effectivePlan.discounted_price === '0.00')) {
          await postPublicProtected(
            NON_SECURE_ENDPOINTS.FREE_PLAN_TRACK,
            { price_charged: effectivePlan.discounted_price === '0.00' ? effectivePlan.discounted_price : effectivePlan.price, customer: newCustomerId, plan: effectivePlan.id },
            authHeader,
          )
          changeStep(is_booking_enabled ? 3 : 4)
          return
        }

        // --- No active payment method ---
        if (!selectedLocationObject?.active_payment_method) {
          try { await postPublic(NON_SECURE_ENDPOINTS.HUBSPOT_TICKET_ENDPOINT, { organization_id: org.id, location_id: selectedLocationObject?.id }) } catch {}
          changeStep(is_booking_enabled ? 3 : 4)
          return
        }

        // --- No services with plans (call servicesWithPlan() directly — plansWithServices state may be stale if org loaded after mount) ---
        if (currentServicesWithPlan.length < 1 && !selectedPlan) {
          changeStep(is_booking_enabled ? 3 : 4)
          return
        }
      }

      changeStep(2)
      scrollToTop()
    } catch (err) {
      console.error('Step 1 submission error:', err)
      toast.error(parseApiError(err))
    } finally {
      setLoading(false)
    }
  }

  // Reset step to 1 when dialog closes (backdrop click bypasses closeDialogue)
  useEffect(() => {
    if (!dialog) setStep(1)
  }, [dialog])

  // ------- reCAPTCHA: load script when dialog opens on step 1 -------
  useEffect(() => {
    if (dialog && step === 1 && organization?.recaptcha_enabled) {
      loadRecaptchaScript()
    }
  }, [dialog, step, organization?.recaptcha_enabled, loadRecaptchaScript])

  // ------- reCAPTCHA: render widget once per mount -------
  useEffect(() => {
    if (!recaptchaReady || !organization?.recaptcha_enabled || step !== 1) return

    const siteKey = getSiteKey()
    if (!siteKey) {
      console.warn('[reCAPTCHA] NEXT_PUBLIC_SITE_KEY_RECAPTCHA is not set — skipping widget render')
      return
    }

    const g = (window as any).grecaptcha
    if (!g?.render) return

    if (captchaWidgetId.current !== null) return

    const el = document.getElementById('recaptcha-checkout')
    if (!el || el.childElementCount > 0) return

    try {
      const id = g.render('recaptcha-checkout', {
        sitekey: siteKey,
        callback: async (token: string) => {
          // Store in sessionStorage AND in the shared uiStore so all hook instances can use it
          sessionStorage.setItem('recaptcha_token', token)
          useUiStore.getState().setCheckoutAuthToken(token)
          try {
            const result: any = await postPublic(NON_SECURE_ENDPOINTS.GOOGLERECAPTCHA, { token })
            if (result?.success) setRecaptchaVerified(true)
          } catch {
            setRecaptchaVerified(false)
          }
        },
        'expired-callback': () => {
          // Token expired — clear both stores so the next API call doesn't use a stale token
          sessionStorage.removeItem('recaptcha_token')
          useUiStore.getState().setCheckoutAuthToken('')
          setRecaptchaVerified(false)
        },
        'error-callback': () => {
          sessionStorage.removeItem('recaptcha_token')
          useUiStore.getState().setCheckoutAuthToken('')
          setRecaptchaVerified(false)
        },
      })
      captchaWidgetId.current = id
    } catch (err) {
      console.error('[reCAPTCHA] render failed:', err)
    }

    // Reset the ref on cleanup so React Strict Mode's remount can re-inject into the fresh DOM element
    return () => { captchaWidgetId.current = null }
  }, [recaptchaReady, step, organization?.recaptcha_enabled, getSiteKey, postPublic])

  // ------- reCAPTCHA: full reset only when dialog closes -------
  // Do NOT reset on step change — the token must survive into steps 2 and 3
  useEffect(() => {
    if (!organization?.recaptcha_enabled) return
    if (dialog) return  // dialog just opened — let the render effect handle it
    setRecaptchaVerified(false)
    sessionStorage.removeItem('recaptcha_token')
    useUiStore.getState().setCheckoutAuthToken('')
    if (captchaWidgetId.current !== null) {
      try { (window as any).grecaptcha?.reset(captchaWidgetId.current) } catch {}
      captchaWidgetId.current = null
    }
  }, [dialog, organization?.recaptcha_enabled])

  // ------- init -------
  useEffect(() => {
    const init = async () => {
      const plans = await servicesWithPlan()
      setPlansWithServices(plans ?? [])
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select location when there is only one (no dropdown shown)
  useEffect(() => {
    if (locations.length === 1 && !selectedLocationObject) {
      setSelectedLocationObject(locations[0])
    }
  }, [locations, selectedLocationObject, setSelectedLocationObject])

  // ------- step 4 redirect -------
  useEffect(() => {
    if (step === 4 && organization?.is_thanks_redirect_enabled) {
      setDialog(false)
      router.push('/thank-you')
      setStep(1)
    }
  }, [step, organization, setDialog, router])

  // ------- thank you text -------
  const thanksText = useMemo(() => {
    if (organization?.thanks_text && !selectedEvent)
      return organization.thanks_text
    if (organization?.event_thanks_text && selectedEvent)
      return organization.event_thanks_text
    if (servicesWithPlan().length < 1 && !selectedEvent)
      return 'for your interest. A member of our team will be reaching out to you shortly!'
    return 'We are looking forward to seeing you! We have emailed you a receipt. Please present your receipt when you arrive for your first class.'
  }, [organization, selectedEvent, servicesWithPlan])

  // ------- render step 1 -------
  const renderStep1 = () => (
    <div className="step-1 mt-0">
      <div className="space-y-0">
        {/* Honeypot */}
        <input
          type="text"
          value={contactTime}
          onChange={(e) => setContactTime(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
          style={{ display: 'none' }}
          aria-hidden="true"
          name="website"
        />

        {/* Promo code banner */}
        {!selectedEvent &&
          (organization as any)?.promoCode?.discount &&
          (organization as any)?.promoCode?.discount !== 100 && (
            <p className="text-center text-sm font-semibold mb-2">
              Get {Number((organization as any).promoCode.discount).toFixed(0)}% off on next
              page
            </p>
          )}

        {/* First Name */}
        <div className="center-input max-w-[300px] mx-auto mb-3">
          <label className="block text-sm text-black mb-1">First Name</label>
          <input
            type="text"
            name="first_name"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            placeholder="First Name"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 h-[38px]"
          />
          {errors.firstname && (
            <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="center-input max-w-[300px] mx-auto mb-3">
          <label className="block text-sm text-black mb-1">Last Name</label>
          <input
            type="text"
            name="last_name"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            placeholder="Last Name"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 h-[38px]"
          />
          {errors.lastname && (
            <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="center-input max-w-[300px] mx-auto mb-3">
          <label className="block text-sm text-black mb-1">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={mobile}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder={
              isAustralia || isNewZealand
                ? 'Phone Number (10 digits)'
                : isUk
                ? 'Phone Number (10–11 digits)'
                : '(###)-###-####'
            }
            inputMode="numeric"
            autoComplete="tel-national"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 h-[38px]"
          />
          {errors.mobile && (
            <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
          )}
        </div>

        {/* Email */}
        <div className="center-input max-w-[300px] mx-auto mb-3">
          <label className="block text-sm text-black mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            autoComplete="email"
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 h-[38px]"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Custom Field */}
        {organization?.show_custom_field && (
          <div className="center-input max-w-[300px] mx-auto mb-3">
            <label className="block text-sm text-black mb-1">
              {organization.customer_custom_field || 'Custom Field'}
            </label>
            <input
              type="text"
              name="customField"
              value={customField}
              onChange={(e) => setCustomField(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 h-[38px]"
            />
          </div>
        )}

        {/* Reason for joining */}
        {organization?.show_reason_for_joining && (
          <div className="center-input max-w-[300px] mx-auto mb-3">
            <label className="block text-sm text-black mb-1">
              Reason for Joining
            </label>
            <input
              type="text"
              name="reasonForJoining"
              value={reasonForJoining}
              onChange={(e) => setReasonForJoining(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 h-[38px]"
            />
          </div>
        )}

        {/* Location selector */}
        {locations.length > 1 && (
          <div className="center-input max-w-[300px] mx-auto mb-3">
            <label className="block text-sm text-black mb-1">Location</label>
            <div className="flex gap-2">
              <select
                value={selectedLocationObject?.id ?? ''}
                onChange={(e) => {
                  const loc = locations.find(
                    (l: any) => l.id === Number(e.target.value)
                  )
                  if (loc) {
                    setSelectedLocationObject(loc)
                    locationChanged()
                  }
                }}
                className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500 h-[38px]"
              >
                <option value="">Select a Location</option>
                {locations.map((loc: any) => (
                  <option key={loc.id} value={loc.id}>
                    {locationLabel(loc)}
                  </option>
                ))}
              </select>
              {locations.length > 2 && (
                <button
                  type="button"
                  onClick={() => getLocationCoordinates?.()}
                  title="Get Nearest Location"
                  className="border border-gray-300 rounded px-2 text-gray-500 hover:bg-gray-50 h-[38px]"
                  aria-label="Get nearest location"
                >
                  &#9679;
                </button>
              )}
            </div>
            {errors.location && (
              <p className="text-red-500 text-xs mt-1">{errors.location}</p>
            )}
          </div>
        )}

        {/* Consent checkbox (non-UK) */}
        {!isUk && organization?.consent_checkbox_enabled && (
          <div className="center-input max-w-[300px] mx-auto mb-3 flex items-start gap-2">
            <input
              type="checkbox"
              checked={smsOptIn}
              onChange={(e) => setSmsOptIn(e.target.checked)}
              className="mt-1 shrink-0"
            />
            <span
              className="text-xs"
              dangerouslySetInnerHTML={{
                __html: organization.consent_disclosure_text ?? '',
              }}
            />
          </div>
        )}

        {/* reCAPTCHA widget — only render when sitekey is configured */}
        {organization?.recaptcha_enabled && getSiteKey() && (
          <div className="center-input max-w-[300px] mx-auto mb-3">
            {recaptchaReady ? (
              <div id="recaptcha-checkout" />
            ) : (
              <p className="text-xs text-gray-400 text-center py-1">Loading reCAPTCHA…</p>
            )}
          </div>
        )}

        {/* GET STARTED button */}
        <div className="center-input max-w-[300px] mx-auto pb-3">
          <div className="flex justify-end">
            <button
              type="button"
              disabled={loading || (!!organization?.recaptcha_enabled && !!getSiteKey() && !recaptchaVerified)}
              onClick={validateStep1}
              className="text-white px-7 py-3 text-sm font-semibold rounded disabled:opacity-50"
              style={{
                borderRadius: 3,
                backgroundColor: '#494949',
                marginBottom: 12,
              }}
              aria-label="Get started"
            >
              {loading ? 'Please wait...' : 'GET STARTED'}
            </button>
          </div>
        </div>

        {/* UK opt-in notice */}
        {isUk && (
          <div className="px-5 pb-5 text-xs text-gray-600">
            <p>
              By opting in, You agree to receive periodic text messages &amp;
              emails from {organization?.name}. Your information will never be
              shared. Reply STOP to cancel. Standard rate may apply. View our{' '}
              <Link href="/privacy-policy" className="underline">
                Terms of service &amp; Privacy Policy
              </Link>
              .
            </p>
          </div>
        )}
      </div>
    </div>
  )

  // ------- render step 4 (thank you) -------
  const renderThankYou = () => (
    <div className="flex justify-center text-center px-4 py-8">
      <div style={{ padding: '0 17px', minHeight: '78vh', marginTop: '1rem' }}>
        <h3 className="text-4xl font-semibold mb-4" style={{ fontFamily: 'Roboto, sans-serif' }}>
          Thank you
        </h3>
        <p className="text-sm mb-6">{thanksText}</p>
        <span className="text-5xl">&#128522;</span>
        <br />
        <button
          onClick={closeDialogue}
          className="mt-10 px-6 py-2 text-white rounded"
          style={{ backgroundColor: '#1976D2' }}
          aria-label="Close"
        >
          Close
        </button>
      </div>
    </div>
  )

  // ------- main render -------
  return (
    <div
      className="rounded-none"
      style={{ background: 'transparent', borderRadius: 0 }}
    >
      {/* Close button (only outside checkout page) */}
      {!isOnCheckoutPage && (
        <button
          onClick={closeDialogue}
          className="absolute top-0 left-0 z-[999] text-white bg-transparent border-none text-xl p-2"
          aria-label="Close checkout dialog"
          style={{ lineHeight: 1 }}
        >
          &#10005;
        </button>
      )}

      <div className="checkout-section bg-white h-full">
        <div className="pt-0 py-4 px-0">
          {/* Tabs (only if chatbot enabled) */}
          {organization?.chatbot_enabled && (
            <div className="flex w-full mb-0" role="tablist">
              <button
                role="tab"
                aria-selected={activeTab === 'form'}
                aria-controls="form-panel"
                id="form-tab"
                onClick={() => setActiveTab('form')}
                className="flex-1 h-[55px] flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all"
                style={{
                  backgroundColor: accentColor,
                  filter: activeTab !== 'form' ? 'brightness(80%)' : 'none',
                }}
              >
                <span aria-hidden="true">&#9776;</span>
                <span className="tab-text">Request Info</span>
              </button>
              <hr
                style={{ borderColor: '#fff', borderWidth: 1 }}
                className="h-full"
                aria-hidden="true"
              />
              <button
                role="tab"
                aria-selected={activeTab === 'chatbot'}
                aria-controls="chatbot-panel"
                id="chatbot-tab"
                onClick={() => setActiveTab('chatbot')}
                className="flex-1 h-[55px] flex items-center justify-center gap-2 font-semibold text-sm text-white transition-all"
                style={{
                  backgroundColor: accentColor,
                  filter: activeTab !== 'chatbot' ? 'brightness(80%)' : 'none',
                }}
              >
                <span aria-hidden="true">&#129302;</span>
                <span className="tab-text">Chat with Us</span>
              </button>
            </div>
          )}

          {/* Form tab panel */}
          {activeTab === 'form' && (
            <div role="tabpanel" aria-labelledby="form-tab" id="form-panel">
              <div className="checkout-center mx-auto mt-0">
                {/* Title */}
                <h2
                  id="stepperId"
                  className="text-center text-white font-semibold py-6 pl-10 pr-4 mb-0"
                  style={{
                    fontSize: 25,
                    backgroundColor: '#000',
                  }}
                >
                  {selectedEvent ? String((selectedEvent as any).name ?? '') : organization?.stepper_text}
                </h2>

                {/* Progress bar */}
                <div
                  className="relative h-[30px] bg-gray-200"
                  aria-label={`Checkout progress: ${arrangedProgress}% completed`}
                >
                  <div
                    className="absolute inset-y-0 left-0 flex items-center justify-center text-white text-sm font-bold transition-all"
                    style={{ width: `${arrangedProgress}%`, backgroundColor: '#1976D2' }}
                  >
                    <strong>{arrangedProgress}% Completed</strong>
                  </div>
                </div>

                {/* Stepper content */}
                <div className="stepper-container">
                  {step === 1 && renderStep1()}

                  {step === 2 && selectedEvent && (selectedLocationObject ?? locations[0]) && (
                    <EventPurchaseStep
                      selectedLocation={selectedLocationObject ?? locations[0]}
                      changeStep={changeStep}
                    />
                  )}

                  {step === 2 && !selectedEvent && (selectedLocationObject ?? locations[0]) && (
                    <CheckoutStep2
                      selectedLocation={selectedLocationObject ?? locations[0]}
                      changeStep={changeStep}
                    />
                  )}

                  {step === 3 && (selectedLocationObject ?? locations[0]) && (
                    <AppointmentBooking
                      selectedLocation={selectedLocationObject ?? locations[0]}
                      customerId={customerId}
                      changeStep={changeStep}
                    />
                  )}

                  {step === 4 && !organization?.is_thanks_redirect_enabled &&
                    renderThankYou()}
                </div>
              </div>
            </div>
          )}

          {/* Chatbot tab panel */}
          {activeTab === 'chatbot' && (
            <div role="tabpanel" aria-labelledby="chatbot-tab" id="chatbot-panel" className="h-[calc(100vh-55px)]">
              <ChatContainer />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
