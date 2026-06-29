'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useCheckoutDetails } from '@/hooks/useCheckoutDetails'

interface Props {
  selectedLocation: any
  changeStep: (step: number) => void
}

function formattedDate(startDatetime: string | null | undefined): string {
  if (!startDatetime) return ''
  const d = new Date(startDatetime)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  let hours = d.getHours()
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  return `${month}/${day}/${year} at ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`
}

export function EventPurchaseStep({ selectedLocation, changeStep }: Props) {
  const organization = useOrgStore(s => s.organization)
  const selectedEvent = useUiStore(s => s.selectedEvent)
  const currencySign = organization?.currency_sign ?? '$'

  const {
    quantity,
    incrementQuantity,
    decrementQuantity,
    loading,
    onLoadStripe,
    onLoadBraintree,
    onLoadSquare,
    stripeHasPublishableKey,
    stripeCredsResolved,
    stripeCardComplete,
    stripeElementError,
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
    getState,
    threeDSOverlay,
    arrangeEventPrice,
    validate,
  } = useCheckoutDetails() as any

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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const eventPriceInfo = arrangeEventPrice ? arrangeEventPrice(selectedEvent) : { price: '', disability: false }
  const displayPrice = eventPriceInfo?.price
    ? (parseFloat(eventPriceInfo.price) * quantity).toFixed(2)
    : '0.00'

  const isCompleteDisabled =
    loading ||
    (paymentMethod === 'stripe' && stripeHasPublishableKey && !stripeCardComplete)

  function onCompleteOrder() {
    if (typeof validate === 'function') {
      validate(changeStep)
    }
  }

  const inputCls = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <div className="pb-10 px-4">
      {/* Event header */}
      <h2 className="text-xl font-bold text-black uppercase mb-4">
        {(selectedEvent as any)?.name} REGISTRATION
      </h2>

      {/* Date & Time */}
      <div className="mb-4">
        <label className={labelCls}>Date &amp; Time</label>
        <p className="text-sm text-gray-600 mb-3">{formattedDate((selectedEvent as any)?.start_datetime)}</p>

        {/* Price circle */}
        <div className="flex justify-center mb-4">
          <div className="flex flex-col items-center justify-center rounded-full bg-black text-white font-bold"
            style={{ width: 110, height: 110 }}>
            <span className="text-xs uppercase tracking-wide">Price</span>
            <span className="text-lg leading-tight">{currencySign}{displayPrice}</span>
          </div>
        </div>
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

      {/* Stripe */}
      {isStripeWithKey && (
        <div className="mb-4">
          <label className={labelCls}>
            Card Details
            <Image src="/assets/img/cards.png" alt="cards" width={110} height={28} className="inline-block ml-2 mb-[-4px]" />
          </label>
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
