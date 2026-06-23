'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useCheckoutDetails } from '@/hooks/useCheckoutDetails'

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
    states,
    getPlan,
    serviceId,
    setServiceId,
    getState,
    threeDSOverlay,
    servicesWithPlan,
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

  const pathname = usePathname()
  const isOnCheckoutPage = pathname?.includes('/checkout') ?? false

  const paymentMethod = selectedLocation?.active_payment_method
  const isStripeWithKey = paymentMethod === 'stripe' && stripeHasPublishableKey
  const isFatZebraOrFallback =
    paymentMethod === 'fat_zebra' ||
    (paymentMethod === 'stripe' && stripeCredsResolved && !stripeHasPublishableKey)
  const isSquare = paymentMethod === 'square'
  const isBraintree = paymentMethod === 'braintree'
  const isAquila = paymentMethod === 'aquila'

  useEffect(() => {
    // Set location object reference
    if (typeof setSelectedLocationObject === 'function') {
      setSelectedLocationObject(selectedLocation)
    }

    // Load payment method SDK
    if (paymentMethod === 'stripe' && typeof onLoadStripe === 'function') {
      onLoadStripe()
    } else if (paymentMethod === 'braintree' && typeof onLoadBraintree === 'function') {
      onLoadBraintree()
    } else if (paymentMethod === 'square' && typeof onLoadSquare === 'function') {
      onLoadSquare()
    }

    // Load states for aquila billing
    if (typeof getState === 'function') {
      getState()
    }

    // Load primary service plan
    if (typeof getPlan === 'function' && serviceId) {
      getPlan(serviceId)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function getServiceId() {
    const svc = servicesWithPlan?.()?.find((s: any) => s.name === selectedClass)
    if (svc) {
      if (typeof setServiceId === 'function') setServiceId(svc.id)
      if (typeof getPlan === 'function') getPlan(svc.id)
    }
  }

  function onCompleteOrder() {
    // validate is not exposed from the migrated hook yet; call via form submit
    const validate = (useCheckoutDetails as any).validate
    if (typeof validate === 'function') {
      validate({})
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

  return (
    <div className="pb-10 px-4">
      {/* Service selector */}
      <div className="mb-4">
        <select
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={selectedClass}
          onChange={e => {
            setSelectedClass(e.target.value)
            getServiceId()
          }}
        >
          {(firstClass ?? []).map((cls: string) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>
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

      {/* Order summary table */}
      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left py-3">
                <h4 className="text-black font-bold">Items</h4>
              </th>
              <th className="text-right py-3">
                <h4 className="text-black font-bold">Price</h4>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Plan row */}
            <tr>
              <td>
                <h5 className="text-black pt-4">
                  {plan?.amount_of_units} {unitLabel} {ofClasses}
                </h5>
              </td>
              <td className="text-right">
                <h5 className="text-black pt-4">
                  {currencySign}{planTotal}
                </h5>
              </td>
            </tr>

            {/* Free items */}
            {(plan?.free_items ?? []).map((item: string, i: number) => (
              <tr key={i}>
                <td>
                  <h5 className="text-black">{item}</h5>
                </td>
                <td className="text-right">
                  <h5 className="text-black">FREE</h5>
                </td>
              </tr>
            ))}

            {/* Total */}
            <tr>
              <td>
                <h3 className="text-black font-bold">Total</h3>
              </td>
              <td className="text-right">
                <h3 className="text-black font-bold">
                  {currencySign}{planTotal}
                </h3>
              </td>
            </tr>

            {/* Savings */}
            <tr>
              <td>
                <h4 className="text-black font-bold py-5">Your Savings</h4>
              </td>
              <td className="text-right">
                <h4 className="text-black">
                  {currencySign}{savings}
                </h4>
              </td>
            </tr>
          </tbody>
        </table>
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
