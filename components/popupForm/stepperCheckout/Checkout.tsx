'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { useCheckoutDetails } from '@/hooks/useCheckoutDetails'
// import { useValidation } from '@/hooks/useValidation'
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

export function Checkout() {
  const router = useRouter()
  const pathname = usePathname()

  const organization = useOrgStore((s) => s.organization)
  const locations = useOrgStore((s) => s.locations)
  const dialog = useUiStore((s) => s.dialog)
  const setDialog = useUiStore((s) => s.setDialog)
  const selectedEvent = useOrgStore((s) => (s as any).selectedEvent ?? null)

  const {
    servicesWithPlan,
    getFirstServicePlanByOrder,
    getPlan,
    getLocationCoordinates,
    form,
    selectedLocationObject,
    serviceId,
    students,
    selectedClass,
  } = useCheckoutDetails()

  // const { isRequired, emailRule, max, min } = useValidation()

  // Step state
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [customerId, setCustomerId] = useState<number>(2089)
  const [plansWithServices, setPlansWithServices] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'form' | 'chatbot'>('form')

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

  const isUk = useMemo(() => organization?.country === 'UK', [organization])
  const isAustralia = useMemo(
    () => organization?.country === 'Australia',
    [organization]
  )
  const isNewZealand = useMemo(
    () => organization?.country === 'New Zealand',
    [organization]
  )

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
    if (!lastname.trim()) newErrors.lastname = 'Last name is required'
    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Please enter a valid email'
    if (isUk && !mobile.trim()) newErrors.mobile = 'Phone number is required'
    if (locations.length > 1 && !selectedLocationObject?.id)
      newErrors.location = 'Please select a location'

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    await completeStep1()
  }

  const completeStep1 = async () => {
    let arrangedTags: string[] = []
    if (pathname === '/') {
      arrangedTags = ['general']
    } else if (selectedEvent) {
      arrangedTags = ['event']
    }

    try {
      setLoading(true)

      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''
      const res = await fetch(`${BACKEND_URL}/website/lead/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstname,
          last_name: lastname,
          email,
          phone: mobile,
          location: selectedLocationObject?.id,
          service: serviceId,
          tags: arrangedTags,
          sms_opt_in: smsOptIn,
          custom_field: customField,
          reason_for_joining: reasonForJoining,
        }),
      })

      if (!res.ok) throw new Error('Lead submission failed')
      const data = await res.json()
      const newCustomerId = data?.customer_id ?? data?.id ?? customerId
      setCustomerId(newCustomerId)

      // Update checkout form state
      form.email = email
      form.phone = mobile
      students.splice(0, students.length, { first_name: firstname, last_name: lastname })

      const is_booking_enabled = organization?.is_booking_enabled

      // Free event
      if (selectedEvent && !Number(selectedEvent.price)) {
        changeStep(4)
        return
      }

      const targeted_service = organization?.services?.find(
        (s: any) => s.id === serviceId
      )
      const firstServicePlanByOrder = getFirstServicePlanByOrder(targeted_service as any)
      const firstPlanByOrder = firstServicePlanByOrder?.plan
      const selectedPlan = (useUiStore.getState() as any).selectedPlan

      // No service plans at all
      if (!selectedPlan && !targeted_service?.service_plans?.length && !selectedEvent) {
        changeStep(is_booking_enabled ? 3 : 4)
        return
      }

      // Free plan
      const isFree =
        (selectedPlan &&
          (selectedPlan.price === '0.00' ||
            selectedPlan.discounted_price === '0.00')) ||
        (!selectedPlan &&
          (!firstPlanByOrder ||
            firstPlanByOrder.price === '0.00' ||
            firstPlanByOrder.discounted_price === '0.00'))

      if (!selectedEvent && isFree) {
        changeStep(is_booking_enabled ? 3 : 4)
        return
      }

      // No active payment method
      if (!selectedLocationObject?.active_payment_method) {
        changeStep(is_booking_enabled && !selectedEvent ? 3 : 4)
        return
      }

      // No services / plans
      if (
        !selectedLocationObject ||
        !organization?.services?.length ||
        (!organization.services.find((s: any) => s.service_plans?.length > 0) &&
          !selectedEvent)
      ) {
        if (plansWithServices.length < 1 && !selectedEvent) {
          changeStep(is_booking_enabled ? 3 : 4)
        }
        return
      }

      // Default: go to payment step
      if (
        plansWithServices.length < 1 &&
        !selectedEvent &&
        !selectedPlan &&
        !targeted_service?.service_plans?.length
      ) {
        changeStep(is_booking_enabled ? 3 : 4)
      } else {
        changeStep(2)
        scrollToTop()
      }
    } catch (err) {
      console.error('Step 1 submission error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ------- init -------
  useEffect(() => {
    const init = async () => {
      const plans = await servicesWithPlan()
      setPlansWithServices(plans ?? [])
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
    if (plansWithServices.length < 1 && !selectedEvent)
      return 'for your interest. A member of our team will be reaching out to you shortly!'
    return 'We are looking forward to seeing you! We have emailed you a receipt. Please present your receipt when you arrive for your first class.'
  }, [organization, selectedEvent, plansWithServices])

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
            onChange={(e) => setMobile(e.target.value)}
            placeholder={
              isAustralia || isNewZealand
                ? 'Phone Number (10 digits)'
                : isUk
                ? 'Phone Number (10–11 digits)'
                : 'Phone Number'
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
                    if (selectedLocationObject) Object.assign(selectedLocationObject, loc)
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

        {/* GET STARTED button */}
        <div className="center-input max-w-[300px] mx-auto pb-3">
          <div className="flex justify-end">
            <button
              type="button"
              disabled={loading}
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
                  {selectedEvent ? selectedEvent.name : organization?.stepper_text}
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

                  {step === 2 && selectedEvent && selectedLocationObject && (
                    <EventPurchaseStep
                      selectedLocation={selectedLocationObject}
                      changeStep={changeStep}
                    />
                  )}

                  {step === 2 && !selectedEvent && selectedLocationObject && (
                    <CheckoutStep2
                      selectedLocation={selectedLocationObject}
                      changeStep={changeStep}
                    />
                  )}

                  {step === 3 && selectedLocationObject && (
                    <AppointmentBooking
                      selectedLocation={selectedLocationObject}
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
            <div role="tabpanel" aria-labelledby="chatbot-tab" id="chatbot-panel">
              <div className="max-w-lg mx-auto p-5">
                <p className="text-center text-gray-500 py-8">
                  Chat feature — connect your ChatBot component here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
