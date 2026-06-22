'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
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
  const selectedEvent = useOrgStore(s => (s as any).selectedEvent)
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
    states,
    getState,
    threeDSOverlay,
    arrangeEventPrice,
  } = useCheckoutDetails() as any

  const [currentYear] = useState<number>(new Date().getFullYear())
  const [cardHolder, setCardHolder] = useState('')
  const [creditCard, setCreditCard] = useState('')
  const [expMonth, setExpMonth] = useState('')
  const [expYear, setExpYear] = useState('')
  const [cvv, setCvv] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [street, setStreet] = useState('')

  const paymentMethod = selectedLocation?.active_payment_method
  const isStripeWithKey = paymentMethod === 'stripe' && stripeHasPublishableKey
  const isFatZebraOrFallback =
    paymentMethod === 'fat_zebra' ||
    (paymentMethod === 'stripe' && stripeCredsResolved && !stripeHasPublishableKey)
  const isSquare = paymentMethod === 'square'
  const isBraintree = paymentMethod === 'braintree'
  const isAquila = paymentMethod === 'aquila'

  useEffect(() => {
    if (typeof setSelectedLocationObject === 'function') {
      setSelectedLocationObject(selectedLocation)
    }

    if (paymentMethod === 'stripe' && typeof onLoadStripe === 'function') {
      onLoadStripe()
    } else if (paymentMethod === 'braintree' && typeof onLoadBraintree === 'function') {
      onLoadBraintree()
    } else if (paymentMethod === 'square' && typeof onLoadSquare === 'function') {
      onLoadSquare()
    }

    if (typeof getState === 'function') {
      getState()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const eventPriceInfo = arrangeEventPrice ? arrangeEventPrice(selectedEvent) : { price: '', disability: false }
  const displayPrice =
    eventPriceInfo?.price
      ? (parseFloat(eventPriceInfo.price) * quantity).toFixed(2)
      : '0.00'

  const isCompleteDisabled =
    loading ||
    (paymentMethod === 'stripe' && stripeHasPublishableKey && !stripeCardComplete)

  function onCompleteOrder() {
    const validate = (useCheckoutDetails as any).validate
    if (typeof validate === 'function') {
      validate({})
    }
  }

  return (
    <div className="pb-10 px-4">
      {/* Event header */}
      <h2 className="text-xl font-bold text-black uppercase mb-4">
        {selectedEvent?.name} REGISTRATION
      </h2>

      {/* Date & Time section */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          Date &amp; Time
        </label>
        <p className="text-sm text-gray-600 mb-3">
          {formattedDate(selectedEvent?.start_datetime)}
        </p>

        {/* Price circle */}
        <div className="flex justify-center mb-4">
          <div
            className="flex flex-col items-center justify-center rounded-full bg-black text-white font-bold"
            style={{ width: 110, height: 110 }}
          >
            <span className="text-xs uppercase tracking-wide">Price</span>
            <span className="text-lg leading-tight">
              {currencySign}{displayPrice}
            </span>
          </div>
        </div>
      </div>

      {/* Quantity row */}
      <div className="flex items-center justify-between border border-gray-200 rounded px-4 py-2 mb-4 mx-1">
        <h4 className="font-bold text-base" style={{ color: '#3E3E3E' }}>
          Quantity
        </h4>
        <button
          type="button"
          onClick={decrementQuantity}
          disabled={quantity === 0}
          className={[
            'w-8 h-8 flex items-center justify-center rounded-full font-bold text-white transition-colors',
            quantity > 0 ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-300 cursor-not-allowed',
          ].join(' ')}
        >
          &minus;
        </button>
        <span className="text-base font-medium w-8 text-center">{quantity}</span>
        <button
          type="button"
          onClick={incrementQuantity}
          className="w-8 h-8 flex items-center justify-center rounded-full font-bold text-white bg-green-500 hover:bg-green-600 transition-colors"
        >
          &#43;
        </button>
      </div>

      {/* Stripe section */}
      {isStripeWithKey && (
        <div className="mb-4">
          <label className="block text-black text-sm mb-1">
            Card Details
            <Image
              src="/assets/img/cards.png"
              alt="Accepted payment cards"
              width={110}
              height={28}
              className="inline-block ml-2 mb-[-4px]"
            />
          </label>
          <div
            id="stripe-card-element"
            className="border border-gray-300 rounded px-3 py-3 bg-white"
          />
          {stripeElementError && (
            <p className="text-red-500 text-xs mt-1">{stripeElementError}</p>
          )}
        </div>
      )}

      {/* Fat Zebra / Stripe fallback section */}
      {isFatZebraOrFallback && (
        <div className="mb-4 space-y-3">
          {paymentMethod === 'fat_zebra' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={cardHolder}
                onChange={e => setCardHolder(e.target.value)}
                placeholder="Name on card"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
              <Image
                src="/assets/img/cards.png"
                alt="Accepted payment cards"
                width={110}
                height={28}
                className="inline-block ml-2 mb-[-4px]"
              />
            </label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={creditCard}
              onChange={e => setCreditCard(e.target.value)}
              placeholder="•••• •••• •••• ••••"
              maxLength={19}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exp. Month
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={expMonth}
                onChange={e => setExpMonth(e.target.value)}
                placeholder="MM"
                maxLength={2}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exp. Year
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={expYear}
                onChange={e => setExpYear(e.target.value)}
                placeholder="YYYY"
                maxLength={4}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                CVV
                <Image
                  src="/assets/img/cvv.png"
                  alt="CVV"
                  width={24}
                  height={16}
                  className="inline-block"
                />
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={cvv}
                onChange={e => setCvv(e.target.value)}
                placeholder="•••"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      )}

      {/* Square section */}
      {isSquare && (
        <div className="mb-4">
          <div id="square-payment-form" />
        </div>
      )}

      {/* Braintree section */}
      {isBraintree && (
        <div className="mb-4 relative">
          <form id="hosted-fields-form" className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div
                id="card-number"
                className="braintree-frame-input border border-gray-300 rounded px-3 py-2 h-10 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <div
                id="cvv"
                className="braintree-frame-input border border-gray-300 rounded px-3 py-2 h-10 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <div
                id="expiration-date"
                className="braintree-frame-input border border-gray-300 rounded px-3 py-2 h-10 bg-white"
              />
            </div>
          </form>

          {/* 3DS overlay spinner */}
          {threeDSOverlay && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10 rounded">
              <div className="w-10 h-10 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Aquila section */}
      {isAquila && (
        <div className="mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Number
            </label>
            <input
              type="text"
              id="cardnumber"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={creditCard}
              onChange={e => setCreditCard(e.target.value)}
              placeholder="•••• •••• •••• ••••"
              maxLength={19}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exp. Month
              </label>
              <input
                type="text"
                id="expiremonth"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={expMonth}
                onChange={e => setExpMonth(e.target.value)}
                placeholder="MM"
                maxLength={2}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exp. Year
              </label>
              <input
                type="text"
                id="expireyear"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={expYear}
                onChange={e => setExpYear(e.target.value)}
                placeholder="YYYY"
                maxLength={4}
              />
            </div>
          </div>

          {/* Billing address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <textarea
              id="billing_street"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
              rows={2}
              value={street}
              onChange={e => setStreet(e.target.value)}
              placeholder="Street address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              id="billing_city"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="City"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                id="billing_state"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={state}
                onChange={e => setState(e.target.value)}
              >
                <option value="">Select state</option>
                {(states ?? []).map((s: any) => (
                  <option key={s.id ?? s.value ?? s} value={s.abbreviation ?? s.value ?? s}>
                    {s.name ?? s.label ?? s}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                id="billing_zipcode"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={zipCode}
                onChange={e => setZipCode(e.target.value)}
                placeholder="ZIP"
                maxLength={10}
              />
            </div>
          </div>
        </div>
      )}

      {/* Complete Order button */}
      <button
        type="button"
        onClick={onCompleteOrder}
        disabled={isCompleteDisabled}
        className={[
          'w-full py-3 rounded text-white font-semibold text-base transition-opacity',
          isCompleteDisabled
            ? 'bg-black opacity-50 cursor-not-allowed'
            : 'bg-black hover:opacity-90',
        ].join(' ')}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </span>
        ) : (
          'Complete Order'
        )}
      </button>

      {/* Trust badges */}
      <div className="flex justify-center gap-4 mt-6">
        <Image
          src="/assets/img/Secure-Badge-Option3.png"
          alt="Secure checkout"
          width={150}
          height={80}
          style={{ objectFit: 'contain' }}
        />
        <Image
          src="/assets/img/satisfaction.png"
          alt="Satisfaction guaranteed"
          width={150}
          height={80}
          style={{ objectFit: 'contain' }}
        />
      </div>
    </div>
  )
}
