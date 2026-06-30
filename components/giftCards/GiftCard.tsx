'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { useNonSecureCalls, NON_SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useCheckoutDetails } from '@/hooks/useCheckoutDetails'
import { useTracking } from '@/hooks/useTracking'
import { useRecaptcha } from '@/hooks/useRecaptcha'
import { getPublicAuthHeader } from '@/lib/utils/initializeSocket'
import { toast } from 'sonner'

const steps = ['Choose Special', 'Sender', 'Recipient', 'Payment']

interface PersonForm {
  first_name: string
  last_name: string
  phone: string
  email: string
}

export function GiftCard() {
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const locations = useOrgStore(s => s.locations)
  const { postPublicProtected } = useNonSecureCalls()
  const { getTrackingPayload } = useTracking()
  const { recaptchaReady, loadRecaptchaScript, getSiteKey } = useRecaptcha()
  const captchaWidgetId = useRef<number | null>(null)
  const [recaptchaVerified, setRecaptchaVerified] = useState(false)
  const { postPublic } = useNonSecureCalls()

  const {
    selectedLocationObject, setSelectedLocationObject,
    form, setForm,
    street, setStreet, city, setCity, state, setState, zipCode, setZipCode, states,
    getState,
    stripeInstance, stripeCardElement,
    stripeCardComplete, stripeElementError,
    stripeHasPublishableKey, stripeCredsResolved,
    hostedFieldsInstance, threeDSInstance,
    threeDSOverlay, setThreeDSOverlay,
    verifiedNonce, setVerifiedNonce,
    squareCard, squarePayment,
    squarePaymentToken, setSquarePaymentToken,
    squareVerificationToken, setSquareVerificationToken,
    onLoadStripe, onLoadBraintree, onLoadSquare,
    destroyStripeElements, removePreviousIframes,
  } = useCheckoutDetails()

  const services = organization?.services ?? []
  const currencySign = organization?.currency_sign ?? '$'
  const recaptchaEnabled = organization?.recaptcha_enabled ?? false

  // Country detection
  const orgCountry = (organization as any)?.country ?? ''
  const isUk = orgCountry === 'GB' || !!(organization as any)?.is_uk
  const isAustralia = orgCountry === 'AU' || !!(organization as any)?.is_australia
  const isNewZealand = orgCountry === 'NZ' || !!(organization as any)?.is_new_zealand

  const [stepNumber, setStepNumber] = useState(1)
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [stripePaymentMethodId, setStripePaymentMethodId] = useState<string | null>(null)

  const [sender, setSender] = useState<PersonForm>({ first_name: '', last_name: '', phone: '', email: '' })
  const [recipient, setRecipient] = useState<PersonForm>({ first_name: '', last_name: '', phone: '', email: '' })
  const [skipRecipient, setSkipRecipient] = useState(false)

  const filteredServices = useMemo(
    () => services.filter((s: any) => !s.parent_service),
    [services]
  )

  useEffect(() => {
    if (!organization?.is_gift_card_enabled) {
      router.push('/')
      return
    }
    if (filteredServices.length > 0) {
      setSelectedService(filteredServices[0].id)
    }
    getState()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sync location
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationObject) {
      setSelectedLocationObject(locations[0])
    }
  }, [locations]) // eslint-disable-line react-hooks/exhaustive-deps

  // Load payment SDK + reCAPTCHA when reaching step 4
  useEffect(() => {
    if (stepNumber !== 4) return
    loadLocationData()
    if (recaptchaEnabled && !recaptchaReady) {
      loadRecaptchaScript()
    }
  }, [stepNumber]) // eslint-disable-line react-hooks/exhaustive-deps

  // Render reCAPTCHA widget once script is ready
  useEffect(() => {
    if (!recaptchaReady || !recaptchaEnabled || stepNumber !== 4) return
    const g = (window as any).grecaptcha
    if (!g?.render) return
    if (captchaWidgetId.current !== null) return
    const el = document.getElementById('recaptcha-gift-card')
    if (!el || el.childElementCount > 0) return
    const id = g.render('recaptcha-gift-card', {
      sitekey: getSiteKey(),
      callback: async (token: string) => {
        sessionStorage.setItem('recaptcha_token', token)
        try {
          const result: any = await postPublic(NON_SECURE_ENDPOINTS.GOOGLERECAPTCHA, { token })
          if (result?.success) setRecaptchaVerified(true)
        } catch {
          setRecaptchaVerified(false)
        }
      },
      'expired-callback': () => {
        sessionStorage.removeItem('recaptcha_token')
        setRecaptchaVerified(false)
      },
      'error-callback': () => {
        sessionStorage.removeItem('recaptcha_token')
        setRecaptchaVerified(false)
      },
    })
    captchaWidgetId.current = id
  }, [recaptchaReady, recaptchaEnabled, stepNumber]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadLocationData = useCallback(async () => {
    if (!selectedLocationObject) return
    const method = selectedLocationObject.active_payment_method
    if (method === 'braintree') {
      await removePreviousIframes()
      onLoadBraintree(selectedLocationObject)
    } else if (method === 'square') {
      onLoadSquare(selectedLocationObject)
    } else if (method === 'stripe') {
      destroyStripeElements()
      onLoadStripe(selectedLocationObject)
    }
  }, [selectedLocationObject, removePreviousIframes, onLoadBraintree, onLoadSquare, destroyStripeElements, onLoadStripe])

  const updateSender = (field: keyof PersonForm, value: string) =>
    setSender(prev => ({ ...prev, [field]: value }))

  const updateRecipient = (field: keyof PersonForm, value: string) =>
    setRecipient(prev => ({ ...prev, [field]: value }))

  const selectStep = (n: number) => {
    if (n < stepNumber) setStepNumber(n)
  }

  const nextStep = () => {
    if (stepNumber === 1 && (!selectedService || !price)) {
      toast.error('Please select a program and enter a price.')
      return
    }
    if (stepNumber === 2 && (!sender.first_name || !sender.last_name || !sender.email)) {
      toast.error('Please fill in all required sender fields.')
      return
    }
    if (stepNumber === 3 && !skipRecipient && (!recipient.first_name || !recipient.last_name || !recipient.email)) {
      toast.error('Please fill in all required recipient fields.')
      return
    }
    setSkipRecipient(false)
    setStepNumber(prev => Math.min(prev + 1, 4))
  }

  const handleSkipRecipient = () => {
    setSkipRecipient(true)
    setStepNumber(4)
  }

  const deductPayment = useCallback(async (overrideStripeId?: string | null, overrideNonce?: string | null, overrideSqToken?: string | null, overrideSqVerif?: string | null) => {
    const method = selectedLocationObject?.active_payment_method
    const data: Record<string, any> = {
      sender: { ...sender, cookie: getTrackingPayload() },
      recipient: skipRecipient ? null : recipient,
      location_id: selectedLocationObject?.id,
      price,
      program_id: selectedService,
      special_message: null,
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
      data.braintree_token = overrideNonce ?? verifiedNonce
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
      data.sender.city = city
      data.sender.street = street
      data.sender.zipcode = zipCode
      data.sender.state = state
    }
    if (method === 'square') {
      const sqToken = overrideSqToken ?? squarePaymentToken
      const sqVerif = overrideSqVerif ?? squareVerificationToken
      data.card_expiration_year = form.card_expiration_year
      data.card_expiration_month = form.card_expiration_month
      data.card_token = sqToken
      data.square_verification_token = sqVerif
    }

    if (!method) {
      toast.error('No active payment method configured.')
      setLoading(false)
      return
    }

    try {
      const authHeader = recaptchaEnabled
        ? (sessionStorage.getItem('recaptcha_token') ?? '')
        : await getPublicAuthHeader(organization!.id, false)

      await postPublicProtected(NON_SECURE_ENDPOINTS.GIFTCARD_PURCHASE, data, authHeader)
      toast.success('Payment confirmed, Gift Card Purchased Successfully')
      await new Promise(res => setTimeout(res, 1000))
      router.push(organization?.thanks_page_text ? '/thank-you' : '/')
    } catch {
      toast.error('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [
    selectedLocationObject, sender, recipient, skipRecipient, price, selectedService,
    stripePaymentMethodId, stripeHasPublishableKey, verifiedNonce,
    squarePaymentToken, squareVerificationToken,
    form, city, street, zipCode, state,
    recaptchaEnabled, organization, getTrackingPayload, postPublicProtected, router,
  ])

  const validateEntries = useCallback(async () => {
    const method = selectedLocationObject?.active_payment_method

    if (method === 'stripe' && !stripeCredsResolved) {
      toast.error('Payment form is still loading. Please wait a moment.')
      return
    }

    setLoading(true)

    if (method === 'braintree') {
      if (!hostedFieldsInstance) { setLoading(false); return }
      try {
        const btState = hostedFieldsInstance.getState()
        if (!btState.fields.number.isValid || !btState.fields.cvv.isValid) {
          toast.error('Invalid card number or CVV.')
          setLoading(false)
          return
        }
        const payload = await hostedFieldsInstance.tokenize()
        setThreeDSOverlay(true)
        const verification = await threeDSInstance.verifyCard({
          amount: price,
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
          await deductPayment(null, verification.nonce)
        } else {
          toast.error('3D Secure verification failed.')
          setLoading(false)
        }
      } catch {
        setThreeDSOverlay(false)
        toast.error('Braintree verification failed.')
        setLoading(false)
      }
    } else if (method === 'square') {
      if (!squareCard) { toast.error('Square payment not initialized.'); setLoading(false); return }
      try {
        const result = await squareCard.tokenize()
        if (result.status !== 'OK') throw new Error(result.errors?.[0]?.detail ?? 'Square payment failed')
        const { expMonth, expYear } = result.details?.card ?? {}
        const expMonthStr = expMonth ? String(expMonth) : form.card_expiration_month
        const expYearStr = expYear ? String(expYear) : form.card_expiration_year
        if (expMonth) setForm((p: any) => ({ ...p, card_expiration_month: expMonthStr }))
        if (expYear) setForm((p: any) => ({ ...p, card_expiration_year: expYearStr }))
        const allLocs = useOrgStore.getState().locations
        const verificationDetails = {
          amount: price,
          currencyCode: allLocs[0]?.state_acronym ?? 'USD',
          intent: 'CHARGE',
          billingContact: {
            familyName: sender.last_name,
            givenName: sender.first_name,
            email: sender.email,
            country: (allLocs[0]?.state_acronym ?? 'US').slice(0, 2),
          },
        }
        const verificationResult = await squarePayment.verifyBuyer(result.token, verificationDetails)
        setSquarePaymentToken(result.token)
        setSquareVerificationToken(verificationResult.token)
        await deductPayment(null, null, result.token, verificationResult.token)
      } catch {
        toast.error('Square 3D Secure payment failed.')
        setLoading(false)
      }
    } else if (method === 'stripe' && stripeHasPublishableKey) {
      if (!stripeInstance || !stripeCardElement) { setLoading(false); return }
      try {
        const { paymentMethod, error } = await stripeInstance.createPaymentMethod({ type: 'card', card: stripeCardElement })
        if (error) { toast.error(error.message); setLoading(false); return }
        setStripePaymentMethodId(paymentMethod.id)
        await deductPayment(paymentMethod.id)
      } catch {
        toast.error('Stripe payment failed.')
        setLoading(false)
      }
    } else {
      await deductPayment()
    }
  }, [
    selectedLocationObject, stripeCredsResolved, stripeHasPublishableKey,
    stripeInstance, stripeCardElement, hostedFieldsInstance, threeDSInstance,
    squareCard, squarePayment, price, sender, form, setForm,
    setThreeDSOverlay, setVerifiedNonce, setSquarePaymentToken, setSquareVerificationToken,
    deductPayment,
  ])

  const paymentMethod = selectedLocationObject?.active_payment_method
  const isManualCard = paymentMethod === 'fat_zebra' || (paymentMethod === 'stripe' && stripeCredsResolved && !stripeHasPublishableKey)

  const updateForm = (field: string, value: string) =>
    setForm((prev: any) => ({ ...prev, [field]: value }))

  // Phone field rules
  const phoneMaxLen = isAustralia || isNewZealand ? 10 : 11
  const phoneMinLen = isAustralia || isNewZealand ? 9 : 10
  const phoneRequired = isUk

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 3DS overlay */}
      {threeDSOverlay && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded p-6 text-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-600">Verifying card security…</p>
          </div>
        </div>
      )}

      {/* Step timeline */}
      <div className="flex justify-between mb-8">
        {steps.map((label, i) => (
          <button key={i} onClick={() => selectStep(i + 1)} className="flex flex-col items-center gap-1 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${stepNumber === i + 1 ? 'bg-blue-600' : stepNumber > i + 1 ? 'bg-green-500' : 'bg-gray-400'}`}>
              {i + 1}
            </div>
            <span className="text-xs font-bold text-center max-[767px]:text-[10px]">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Step 1: Choose Special ── */}
      {stepNumber === 1 && (
        <div className="bg-white border rounded shadow-sm">
          <div className="px-4 py-3 border-b font-semibold">
            Choose From Our {organization?.school_type ?? 'Fitness Classes'} And Specials
          </div>
          <div className="p-4 space-y-4">
            {locations.length > 1 && (
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedLocationObject?.id ?? ''}
                  onChange={e => {
                    const loc = locations.find(l => l.id === Number(e.target.value))
                    if (loc) setSelectedLocationObject(loc)
                  }}
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>
                      {loc.target_locations?.[0] ?? loc.city}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Program</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={selectedService ?? ''}
                  onChange={e => setSelectedService(Number(e.target.value))}
                >
                  {filteredServices.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  min={10}
                  placeholder="Minimum 10"
                />
              </div>
            </div>
            {price && (
              <div className="bg-gray-50 border rounded p-3 font-semibold">
                Price: {currencySign}{price}
              </div>
            )}
          </div>
          <div className="flex justify-end p-4">
            <button onClick={nextStep} className="bg-[#d5242c] text-white px-6 py-2 rounded font-semibold">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Step 2: Sender ── */}
      {stepNumber === 2 && (
        <div className="bg-white border rounded shadow-sm">
          <div className="px-4 py-3 border-b">
            <div className="font-semibold">Sender</div>
            <div className="text-sm text-gray-500">Enter the sender details.</div>
          </div>
          <div className="p-4 space-y-3">
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="First Name *"
              value={sender.first_name}
              onChange={e => updateSender('first_name', e.target.value)}
              maxLength={100}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Last Name *"
              value={sender.last_name}
              onChange={e => updateSender('last_name', e.target.value)}
              maxLength={100}
            />
            <input
              type="tel"
              className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder={phoneRequired ? 'Phone *' : 'Phone'}
              value={sender.phone}
              onChange={e => updateSender('phone', e.target.value.replace(/\D/g, '').slice(0, phoneMaxLen))}
              maxLength={phoneMaxLen}
            />
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="Email *"
              value={sender.email}
              onChange={e => updateSender('email', e.target.value)}
            />
          </div>
          <div className="flex justify-end p-4">
            <button onClick={nextStep} className="bg-[#d5242c] text-white px-6 py-2 rounded font-semibold">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Recipient ── */}
      {stepNumber === 3 && (
        <div className="bg-white border rounded shadow-sm">
          <div className="px-4 py-3 border-b">
            <div className="font-semibold">Recipient <span className="text-gray-400">(Optional)</span></div>
            <div className="text-sm text-gray-500">Enter the recipient details.</div>
          </div>
          <div className="p-4 space-y-3">
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="First Name *"
              value={recipient.first_name}
              onChange={e => updateRecipient('first_name', e.target.value)}
              maxLength={100}
            />
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="Last Name *"
              value={recipient.last_name}
              onChange={e => updateRecipient('last_name', e.target.value)}
              maxLength={100}
            />
            <input
              type="tel"
              className="w-full border rounded px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder={phoneRequired ? 'Phone *' : 'Phone'}
              value={recipient.phone}
              onChange={e => updateRecipient('phone', e.target.value.replace(/\D/g, '').slice(0, phoneMaxLen))}
              maxLength={phoneMaxLen}
            />
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              placeholder="Email *"
              value={recipient.email}
              onChange={e => updateRecipient('email', e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 p-4">
            <button onClick={handleSkipRecipient} className="bg-green-600 text-white px-4 py-2 rounded font-semibold flex items-center gap-1">
              Skip ›
            </button>
            <button onClick={nextStep} className="bg-[#d5242c] text-white px-6 py-2 rounded font-semibold">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Payment ── */}
      {stepNumber === 4 && (
        <div className="bg-white border rounded shadow-sm">
          <div className="px-4 py-3 border-b font-semibold">Payment Details</div>
          <div className="p-4">
            <div className="space-y-4">

              {/* Stripe with publishable key */}
              {paymentMethod === 'stripe' && stripeHasPublishableKey && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Card Details
                    <Image src={`/assets/img/cards.png`} width={80} height={20} alt="Accepted cards" className="inline-block ml-2 mb-1 h-5 w-auto" />
                  </label>
                  <div
                    id="stripe-card-element"
                    className="border rounded px-3 py-[10px] min-h-[42px]"
                  />
                  {stripeElementError && (
                    <p className="text-[#fa755a] text-xs mt-1">{stripeElementError}</p>
                  )}
                </div>
              )}

              {/* Manual card fields: Fat Zebra or Stripe-without-key */}
              {isManualCard && (
                <div className="space-y-3">
                  {paymentMethod === 'fat_zebra' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Card Holder Name</label>
                      <input
                        type="text"
                        className="w-full border rounded px-3 py-2"
                        value={form.card_holder}
                        onChange={e => updateForm('card_holder', e.target.value)}
                        placeholder="Card Holder Name"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Card Number
                      <Image src={`/assets/img/cards.png`} width={80} height={20} alt="Accepted cards" className="inline-block ml-2 mb-1 h-5 w-auto" />
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full border rounded px-3 py-2"
                      value={form.credit_card ?? ''}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
                        const formatted = raw.replace(/(.{4})/g, '$1 ').trim()
                        updateForm('credit_card', formatted)
                      }}
                      placeholder="#### #### #### ####"
                      autoComplete="cc-number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiration Date</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Month (MM)"
                        maxLength={2}
                        value={form.card_expiration_month}
                        onChange={e => updateForm('card_expiration_month', e.target.value.replace(/\D/g, '').slice(0, 2))}
                        autoComplete="cc-exp-month"
                        required
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Year (YYYY)"
                        maxLength={4}
                        value={form.card_expiration_year}
                        onChange={e => updateForm('card_expiration_year', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        autoComplete="cc-exp-year"
                        required
                      />
                    </div>
                  </div>
                  <div className="max-w-[180px]">
                    <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                      Security Code
                      <Image src={`/assets/img/cvv-card-img.png`} width={40} height={20} alt="CVV" className="inline-block h-5 w-auto" />
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full border rounded px-3 py-2"
                      placeholder="CVV"
                      maxLength={4}
                      value={form.card_cvv_code}
                      onChange={e => updateForm('card_cvv_code', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      autoComplete="cc-csc"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Braintree hosted fields */}
              {paymentMethod === 'braintree' && (
                <form id="hosted-fields-form" className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <div id="card-number" className="border rounded px-3 py-2 min-h-[42px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVV</label>
                    <div id="cvv" className="border rounded px-3 py-2 min-h-[42px]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiration Date</label>
                    <div id="expiration-date" className="border rounded px-3 py-2 min-h-[42px]" />
                  </div>
                </form>
              )}

              {/* Aquila */}
              {paymentMethod === 'aquila' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Card Number
                      <Image src={`/assets/img/cards.png`} width={80} height={20} alt="Accepted cards" className="inline-block ml-2 mb-1 h-5 w-auto" />
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="w-full border rounded px-3 py-2"
                      value={form.credit_card ?? ''}
                      onChange={e => {
                        const raw = e.target.value.replace(/\D/g, '').slice(0, 16)
                        const formatted = raw.replace(/(.{4})/g, '$1 ').trim()
                        updateForm('credit_card', formatted)
                      }}
                      placeholder="#### #### #### ####"
                      autoComplete="cc-number"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiration Date</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Month (MM)"
                        maxLength={2}
                        value={form.card_expiration_month}
                        onChange={e => updateForm('card_expiration_month', e.target.value.replace(/\D/g, '').slice(0, 2))}
                        required
                      />
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-full border rounded px-3 py-2"
                        placeholder="Year (YYYY)"
                        maxLength={4}
                        value={form.card_expiration_year}
                        onChange={e => updateForm('card_expiration_year', e.target.value.replace(/\D/g, '').slice(0, 4))}
                        required
                      />
                    </div>
                  </div>
                  {/* Billing address */}
                  <p className="font-semibold text-sm pt-2">Billing Address</p>
                  <textarea
                    className="w-full border rounded px-3 py-2 resize-none"
                    placeholder="Address *"
                    rows={1}
                    maxLength={60}
                    value={street}
                    onChange={e => setStreet(e.target.value)}
                    required
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      className="border rounded px-3 py-2"
                      placeholder="City *"
                      maxLength={35}
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      required
                    />
                    <select
                      className="border rounded px-3 py-2"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      required
                    >
                      <option value="">State *</option>
                      {(states as any[]).map((s: any) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="border rounded px-3 py-2"
                      placeholder="Zip *"
                      maxLength={10}
                      value={zipCode}
                      onChange={e => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Square */}
              {paymentMethod === 'square' && (
                <div id="square-payment-form" className="min-h-[100px]" />
              )}

              {/* reCAPTCHA */}
              {recaptchaEnabled && (
                <div id="recaptcha-gift-card" className="mt-2" />
              )}

              {/* Complete Order button */}
              <button
                disabled={loading || (recaptchaEnabled ? !recaptchaVerified : false) || (paymentMethod === 'stripe' && (!stripeCredsResolved || (stripeHasPublishableKey && !stripeCardComplete)))}
                onClick={validateEntries}
                className="w-full mt-4 py-3 bg-black text-white rounded font-semibold disabled:opacity-50"
              >
                {loading ? 'Processing…' : 'Complete Order'}
              </button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Image
                  src="/assets/img/Secure-Badge-Option3.png"
                  width={150}
                  height={60}
                  alt="Secure payment badge"
                  className="max-w-[150px] w-full h-auto"
                />
                <Image
                  src="/assets/img/satisfaction.png"
                  width={150}
                  height={60}
                  alt="Satisfaction guaranteed badge"
                  className="max-w-[150px] w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
