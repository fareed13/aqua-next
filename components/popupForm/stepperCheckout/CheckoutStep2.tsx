'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useCheckoutDetails, interestedServiceSetter } from '@/hooks/useCheckoutDetails'

interface Props {
  selectedLocation: any
  changeStep: (step: number) => void
}

export function CheckoutStep2({ selectedLocation, changeStep }: Props) {
  const organization = useOrgStore(s => s.organization)
  const currencySign = organization?.currency_sign ?? '$'

  const {
    plan,
    students,
    selectedClass,
    setSelectedClass,
    firstClass,
    quantity,
    incrementQuantity,
    decrementQuantity,
    arrangeUnitOfTime,
    loading,
    onLoadStripe,
    onLoadBraintree,
    onLoadSquare,
    stripeHasPublishableKey,
    stripeCredsResolved,
    stripeCardComplete,
    stripeElementError,
    selectedLocationObject,
    setSelectedLocationObject,
    form,
    setForm,
    street,
    setStreet,
    city,
    setCity,
    state,
    setState,
    zipCode,
    setZipCode,
    states,
    getPlan,
    serviceId,
    setServiceId,
    getState,
    threeDSOverlay,
    servicesWithPlan,
    validate,
  } = useCheckoutDetails() as any

  const pathname = usePathname()
  const isOnCheckoutPage = pathname?.includes('/checkout') ?? false
  const setSelectedPlan = useUiStore(s => s.setSelectedPlan)
  const paymentInitialized = useRef(false)

  const paymentMethod = selectedLocation?.active_payment_method
  const isStripeWithKey = paymentMethod === 'stripe' && stripeHasPublishableKey
  const isFatZebraOrFallback =
    paymentMethod === 'fat_zebra' ||
    (paymentMethod === 'stripe' && stripeCredsResolved && !stripeHasPublishableKey)
  const isSquare = paymentMethod === 'square'
  const isBraintree = paymentMethod === 'braintree'
  const isAquila = paymentMethod === 'aquila'

  useEffect(() => {
    if (paymentInitialized.current) return
    paymentInitialized.current = true

    if (typeof setSelectedLocationObject === 'function') {
      setSelectedLocationObject(selectedLocation)
    }

    if (paymentMethod === 'stripe' && typeof onLoadStripe === 'function') {
      onLoadStripe(selectedLocation)
    } else if (paymentMethod === 'braintree' && typeof onLoadBraintree === 'function') {
      onLoadBraintree(selectedLocation)
    } else if (paymentMethod === 'square' && typeof onLoadSquare === 'function') {
      onLoadSquare(selectedLocation)
    }

    if (typeof getState === 'function') {
      getState()
    }

    // serviceId may still be null if hook's init effect hasn't flushed yet;
    // fall back to first service-with-plan so the plan summary shows immediately
    const fallbackId = serviceId ?? servicesWithPlan?.()?.find(() => true)?.id ?? null
    if (typeof getPlan === 'function' && fallbackId) {
      getPlan(fallbackId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function getServiceId(className: string) {
    const svc = servicesWithPlan?.()?.find((s: any) => s.name === className)
    if (svc) {
      setSelectedPlan(null)           // clear any plan selected via button click
      interestedServiceSetter(svc.id) // record as last-visited in cookie
      if (typeof setServiceId === 'function') setServiceId(svc.id)
      if (typeof getPlan === 'function') getPlan(svc.id)
    }
  }

  function onCompleteOrder() {
    if (typeof validate === 'function') {
      validate(changeStep)
    }
  }

  const planPrice = plan?.discounted_price
    ? parseFloat(plan.discounted_price)
    : parseFloat(plan?.price ?? '0')
  const planTotal = (planPrice * (students?.length ?? 1) * quantity).toFixed(2)
  const savings = (
    parseFloat(plan?.price ?? '0') -
    (plan?.discounted_price !== null && plan?.discounted_price !== undefined
      ? parseFloat(plan.discounted_price)
      : parseFloat(plan?.price ?? '0'))
  ).toFixed(2)

  const unitLabel = arrangeUnitOfTime
    ? arrangeUnitOfTime(plan?.amount_of_units, plan?.unit_of_time)
    : plan?.unit_of_time ?? ''
  const ofClasses = unitLabel === 'Classes' ? '' : 'of classes'

  const isCompleteDisabled =
    loading ||
    (paymentMethod === 'stripe' && stripeHasPublishableKey && !stripeCardComplete)

  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="pb-10 px-4">
      {/* Service selector */}
      <div className="mb-4">
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={selectedClass}
          onChange={e => {
            const val = e.target.value
            setSelectedClass(val)
            getServiceId(val)
          }}
        >
          {(firstClass ?? []).map((cls: string) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      {/* Quantity row */}
      <div className="flex items-center justify-between border border-gray-200 rounded px-4 py-2 mb-4 mx-1">
        <h4 className="font-bold text-base" style={{ color: '#3E3E3E' }}>Quantity</h4>
        <button type="button" onClick={decrementQuantity} disabled={quantity === 0}
          className={['w-8 h-8 flex items-center justify-center rounded-full font-bold text-white transition-colors',
            quantity > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed'].join(' ')}>
          &minus;
        </button>
        <span className="text-base font-medium w-8 text-center">{quantity}</span>
        <button type="button" onClick={incrementQuantity}
          className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-green-500 hover:bg-green-600 transition-colors">
          &#43;
        </button>
      </div>

      {/* Order summary table */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-3"><h4 className="text-black font-bold">Items</h4></th>
              <th className="text-right py-3"><h4 className="text-black font-bold">Price</h4></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><h5 className="text-black pt-4">{plan?.amount_of_units} {unitLabel} {ofClasses}</h5></td>
              <td className="text-right"><h5 className="text-black pt-4">{currencySign}{planTotal}</h5></td>
            </tr>
            {(plan?.free_items ?? []).map((item: string, i: number) => (
              <tr key={i}>
                <td><h5 className="text-black">{item}</h5></td>
                <td className="text-right"><h5 className="text-black">FREE</h5></td>
              </tr>
            ))}
            <tr>
              <td><h3 className="text-black font-bold">Total</h3></td>
              <td className="text-right"><h3 className="text-black font-bold">{currencySign}{planTotal}</h3></td>
            </tr>
            <tr>
              <td><h4 className="text-black font-bold py-5">Your Savings</h4></td>
              <td className="text-right"><h4 className="text-black">{currencySign}{savings}</h4></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Stripe — mount point must be in the DOM before onLoadStripe calls card.mount().
          Render it whenever method is stripe and we haven't fallen back to plain inputs,
          so the element exists even before stripeHasPublishableKey resolves. */}
      {paymentMethod === 'stripe' && !isFatZebraOrFallback && (
        <div className="mb-4">
          {isStripeWithKey && (
            <label className={labelCls}>
              Card Details
              <Image src="/assets/img/cards.png" alt="cards" width={110} height={28} className="inline-block ml-2 mb-[-4px]" />
            </label>
          )}
          <div id="stripe-card-element" className="border border-gray-300 rounded px-3 py-3 bg-white" />
          {stripeElementError && <p className="text-red-500 text-xs mt-1">{stripeElementError}</p>}
        </div>
      )}

      {/* Fat Zebra / Stripe fallback */}
      {isFatZebraOrFallback && (
        <div className="mb-4 space-y-3">
          {paymentMethod === 'fat_zebra' && (
            <div>
              <label className={labelCls}>Cardholder Name</label>
              <input type="text" className={inputCls} value={form?.card_holder ?? ''}
                onChange={e => setForm((p: any) => ({ ...p, card_holder: e.target.value }))} />
            </div>
          )}
          <div>
            <label className={labelCls}>
              Card Number
              <Image src="/assets/img/cards.png" alt="cards" width={110} height={28} className="inline-block ml-2 mb-[-4px]" />
            </label>
            <input type="text" className={inputCls} value={form?.credit_card ?? ''}
              onChange={e => setForm((p: any) => ({
                ...p,
                credit_card: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '),
              }))}
              placeholder="•••• •••• •••• ••••" maxLength={19} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>Exp. Month</label>
              <input type="text" className={inputCls} value={form?.card_expiration_month ?? ''}
                onChange={e => setForm((p: any) => ({ ...p, card_expiration_month: e.target.value }))}
                placeholder="MM" maxLength={2} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Exp. Year</label>
              <input type="text" className={inputCls} value={form?.card_expiration_year ?? ''}
                onChange={e => setForm((p: any) => ({ ...p, card_expiration_year: e.target.value }))}
                placeholder="YYYY" maxLength={4} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>
                CVV
                <Image src="/assets/img/cvv.png" alt="CVV" width={24} height={16} className="inline-block ml-1" />
              </label>
              <input type="text" className={inputCls} value={form?.card_cvv_code ?? ''}
                onChange={e => setForm((p: any) => ({ ...p, card_cvv_code: e.target.value }))}
                placeholder="•••" maxLength={4} />
            </div>
          </div>
        </div>
      )}

      {/* Square */}
      {isSquare && <div className="mb-4"><div id="square-payment-form" style={{ minHeight: '100px' }} /></div>}

      {/* Braintree */}
      {isBraintree && (
        <div className="mb-4 relative">
          <form id="hosted-fields-form" className="space-y-3">
            <div>
              <label className={labelCls}>Card Number</label>
              <div id="card-number" className="border border-gray-300 rounded px-3 h-10 bg-white" />
            </div>
            <div>
              <label className={labelCls}>CVV</label>
              <div id="cvv" className="border border-gray-300 rounded px-3 h-10 bg-white" />
            </div>
            <div>
              <label className={labelCls}>Expiration Date</label>
              <div id="expiration-date" className="border border-gray-300 rounded px-3 h-10 bg-white" />
            </div>
          </form>
          {threeDSOverlay && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Aquila */}
      {isAquila && (
        <div className="mb-4 space-y-3">
          <div>
            <label className={labelCls}>Card Number</label>
            <input type="text" id="cardnumber" className={inputCls}
              value={form?.credit_card ?? ''}
              onChange={e => setForm((p: any) => ({
                ...p,
                credit_card: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '),
              }))}
              placeholder="•••• •••• •••• ••••" maxLength={19} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>Exp. Month</label>
              <input type="text" id="expiremonth" className={inputCls}
                value={form?.card_expiration_month ?? ''}
                onChange={e => setForm((p: any) => ({ ...p, card_expiration_month: e.target.value }))}
                placeholder="MM" maxLength={2} />
            </div>
            <div className="flex-1">
              <label className={labelCls}>Exp. Year</label>
              <input type="text" id="expireyear" className={inputCls}
                value={form?.card_expiration_year ?? ''}
                onChange={e => setForm((p: any) => ({ ...p, card_expiration_year: e.target.value }))}
                placeholder="YYYY" maxLength={4} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Street Address</label>
            <textarea id="billing_street" className={`${inputCls} resize-none`} rows={2}
              value={street ?? ''}
              onChange={e => setStreet(e.target.value)}
              placeholder="Street address" />
          </div>
          <div>
            <label className={labelCls}>City</label>
            <input type="text" id="billing_city" className={inputCls}
              value={city ?? ''}
              onChange={e => setCity(e.target.value)}
              placeholder="City" />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className={labelCls}>State</label>
              <select id="billing_state" className={inputCls}
                value={state ?? ''}
                onChange={e => setState(e.target.value)}>
                <option value="">Select state</option>
                {(states ?? []).map((s: any) => (
                  <option key={s.id ?? s} value={s.abbreviation ?? s.id ?? s}>{s.name ?? s}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={labelCls}>ZIP Code</label>
              <input type="text" id="billing_zipcode" className={inputCls}
                value={zipCode ?? ''}
                onChange={e => setZipCode(e.target.value)}
                placeholder="ZIP" maxLength={10} />
            </div>
          </div>
        </div>
      )}

      {/* Complete Order */}
      <button type="button" onClick={onCompleteOrder} disabled={isCompleteDisabled}
        className={['w-full py-3 rounded text-white font-semibold text-base transition-opacity',
          isCompleteDisabled ? 'bg-black opacity-50 cursor-not-allowed' : 'bg-black hover:opacity-90'].join(' ')}>
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : 'Complete Order'}
      </button>

      {/* Trust badges */}
      <div className="flex justify-center gap-4 mt-6">
        <Image src="/assets/img/Secure-Badge-Option3.png" alt="Secure checkout" width={150} height={80} style={{ objectFit: 'contain' }} />
        <Image src="/assets/img/satisfaction.png" alt="Satisfaction guaranteed" width={150} height={80} style={{ objectFit: 'contain' }} />
      </div>
    </div>
  )
}
