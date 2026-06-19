'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useOrgStore } from '@/store/orgStore'
import { useNonSecureCalls, NON_SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import type { Service } from '@/types/api'

export function GiftCard() {
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const locations = useOrgStore(s => s.locations)
  const services = organization?.services ?? []
  const currencySign = organization?.currency_sign ?? '$'
  const { postPublic, getPublic } = useNonSecureCalls()

  const [stepNumber, setStepNumber] = useState(1)
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedLocationObject, setSelectedLocationObject] = useState(locations[0] ?? null)

  const [sender, setSender] = useState({ first_name: '', last_name: '', phone: '', email: '' })
  const [recipient, setRecipient] = useState({ first_name: '', last_name: '', phone: '', email: '' })
  const [skipRecipient, setSkipRecipient] = useState(false)

  const filteredServices = useMemo(
    () => services.filter(s => !s.parent_service),
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
  }, [])

  const updateSender = (field: string, value: string) =>
    setSender(prev => ({ ...prev, [field]: value }))

  const updateRecipient = (field: string, value: string) =>
    setRecipient(prev => ({ ...prev, [field]: value }))

  const nextStep = () => {
    if (stepNumber === 1 && (!selectedService || !price)) return
    if (stepNumber === 2 && (!sender.first_name || !sender.last_name || !sender.email)) return
    setStepNumber(prev => Math.min(prev + 1, 4))
  }

  const selectStep = (n: number) => {
    if (n <= stepNumber) setStepNumber(n)
  }

  const handleSkipRecipient = () => {
    setSkipRecipient(true)
    setStepNumber(4)
  }

  const steps = ['Choose Special', 'Sender', 'Recipient', 'Payment']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Timeline Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((label, i) => (
          <button
            key={i}
            onClick={() => selectStep(i + 1)}
            className="flex flex-col items-center gap-1 flex-1"
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                stepNumber === i + 1 ? 'bg-blue-600' : 'bg-gray-400'
              }`}
            >
              {i + 1}
            </div>
            <span className="text-xs font-bold text-center max-[767px]:text-[10px]">{label}</span>
          </button>
        ))}
      </div>

      {/* Step 1 — Choose Special */}
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
                  {filteredServices.map(s => (
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
            <button
              onClick={nextStep}
              className="bg-[#d5242c] text-white px-6 py-2 rounded font-semibold"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — Sender */}
      {stepNumber === 2 && (
        <div className="bg-white border rounded shadow-sm">
          <div className="px-4 py-3 border-b">
            <div className="font-semibold">Sender</div>
            <div className="text-sm text-gray-500">Enter the sender details.</div>
          </div>
          <div className="p-4 space-y-3">
            {(['first_name', 'last_name', 'phone', 'email'] as const).map(field => (
              <input
                key={field}
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                className="w-full border rounded px-3 py-2"
                placeholder={field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                value={sender[field]}
                onChange={e => updateSender(field, e.target.value)}
              />
            ))}
          </div>
          <div className="flex justify-end p-4">
            <button onClick={nextStep} className="bg-[#d5242c] text-white px-6 py-2 rounded font-semibold">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3 — Recipient */}
      {stepNumber === 3 && (
        <div className="bg-white border rounded shadow-sm">
          <div className="px-4 py-3 border-b">
            <div className="font-semibold">Recipient <span className="text-gray-400">(Optional)</span></div>
            <div className="text-sm text-gray-500">Enter the recipient details.</div>
          </div>
          <div className="p-4 space-y-3">
            {(['first_name', 'last_name', 'phone', 'email'] as const).map(field => (
              <input
                key={field}
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                className="w-full border rounded px-3 py-2"
                placeholder={field.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                value={recipient[field]}
                onChange={e => updateRecipient(field, e.target.value)}
              />
            ))}
          </div>
          <div className="flex justify-end gap-2 p-4">
            <button onClick={handleSkipRecipient} className="bg-green-600 text-white px-4 py-2 rounded font-semibold">
              Skip
            </button>
            <button onClick={nextStep} className="bg-[#d5242c] text-white px-6 py-2 rounded font-semibold">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4 — Payment */}
      {stepNumber === 4 && (
        <div className="bg-white border rounded shadow-sm">
          <div className="px-4 py-3 border-b font-semibold">Payment Details</div>
          <div className="p-4">
            <p className="text-gray-500">Payment form is loaded dynamically based on the location&apos;s active payment method.</p>
            <div id="stripe-card-element" className="border rounded px-3 py-2 mt-4 min-h-[42px]" />
            <div id="square-payment-form" className="mt-4 min-h-[100px]" />
            <button
              disabled={loading}
              onClick={() => setLoading(true)}
              className="w-full mt-6 py-3 bg-black text-white rounded font-semibold disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
