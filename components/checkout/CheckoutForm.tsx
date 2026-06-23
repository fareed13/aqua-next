'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

export function CheckoutForm() {
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const locations = useOrgStore(s => s.locations)
  const location = useOrgStore(s => s.location)

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [selectedLocationId, setSelectedLocationId] = useState(location?.id ?? 0)
  const [smsOptIn, setSmsOptIn] = useState(false)
  const [customField, setCustomField] = useState('')
  const [reasonForJoining, setReasonForJoining] = useState('')

  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#1976D2'
  const stepperText = organization?.stepper_text ?? 'Get Started Today!'
  const isMultiLocation = (locations?.length ?? 0) > 1

  const progress = Math.ceil((50 / 3) * ((step === 0 ? 1 : step) - 1)) + 50

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!firstname.trim() || !lastname.trim() || !email.trim()) return

    setLoading(true)
    try {
      const services = organization?.services ?? []
      const primaryService = services[0]
      const serviceId = primaryService?.id

      const res = await fetch(`${BACKEND_URL}/website/lead/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstname,
          last_name: lastname,
          email,
          phone: mobile,
          location: selectedLocationId || location?.id,
          service: serviceId,
          sms_opt_in: smsOptIn,
          custom_field: customField,
          reason_for_joining: reasonForJoining,
        }),
      })

      if (res.ok) {
        setStep(4)
      }
    } catch (err) {
      console.error('Checkout submission error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (step === 4) {
    const thanksText = organization?.thanks_text || 'for your interest. A member of our team will be reaching out to you shortly!'

    return (
      <div className="max-w-lg mx-auto bg-white shadow rounded p-8 my-8">
        <div className="text-center py-8">
          <h3 className="text-4xl font-bold mb-4">Thank you</h3>
          <p className="text-base mb-6">{thanksText}</p>
          <span className="text-5xl">&#128522;</span>
          <br />
          <button
            onClick={() => router.push('/')}
            className="mt-10 px-6 py-2 text-white rounded"
            style={{ backgroundColor: accentColor }}
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto bg-white shadow rounded overflow-hidden my-8">
      <h2
        className="text-center text-white text-xl font-bold py-6 px-4"
        style={{ backgroundColor: '#000' }}
      >
        {stepperText}
      </h2>

      <div className="relative h-8 bg-gray-200">
        <div
          className="absolute inset-y-0 left-0 flex items-center justify-center text-white text-sm font-bold transition-all"
          style={{ width: `${progress}%`, backgroundColor: '#1976D2' }}
        >
          {progress}% Completed
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="max-w-[300px] mx-auto space-y-4">
          <div>
            <label className="block text-sm text-black mb-1">First Name</label>
            <input
              type="text"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              placeholder="First Name"
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-1">Last Name</label>
            <input
              type="text"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              placeholder="Last Name"
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-1">Phone Number</label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              placeholder="Phone Number"
              inputMode="numeric"
              autoComplete="tel-national"
            />
          </div>

          <div>
            <label className="block text-sm text-black mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              placeholder="Email Address"
              autoComplete="email"
            />
          </div>

          {organization?.show_custom_field && (
            <div>
              <label className="block text-sm text-black mb-1">
                {organization.customer_custom_field || 'Custom Field'}
              </label>
              <input
                type="text"
                value={customField}
                onChange={(e) => setCustomField(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>
          )}

          {organization?.show_reason_for_joining && (
            <div>
              <label className="block text-sm text-black mb-1">Reason for Joining</label>
              <input
                type="text"
                value={reasonForJoining}
                onChange={(e) => setReasonForJoining(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              />
            </div>
          )}

          {isMultiLocation && (
            <div>
              <label className="block text-sm text-black mb-1">Location</label>
              <select
                value={selectedLocationId}
                onChange={(e) => setSelectedLocationId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
              >
                {locations?.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.target_locations?.[0] || loc.city}
                  </option>
                ))}
              </select>
            </div>
          )}

          {organization?.consent_checkbox_enabled && (
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={smsOptIn}
                onChange={(e) => setSmsOptIn(e.target.checked)}
                className="mt-1"
              />
              <span
                className="text-xs"
                dangerouslySetInnerHTML={{
                  __html: organization.consent_disclosure_text || '',
                }}
              />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 text-white text-sm font-semibold rounded disabled:opacity-50"
              style={{ backgroundColor: '#494949' }}
            >
              {loading ? 'Submitting...' : 'GET STARTED'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
