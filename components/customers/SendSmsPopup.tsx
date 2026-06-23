'use client'

import { useState } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

interface Customer {
  id: number
  first_name?: string
  last_name?: string
  raw?: {
    first_name: string
    last_name: string
  }
  [key: string]: unknown
}

interface SendSmsPopupProps {
  smsDialog: boolean
  customer: Customer
  toggleDialog: (val: Customer | null) => void
}

const MESSAGE_TYPES = [
  { text: 'Email', value: 'email' },
  { text: 'SMS', value: 'sms' },
]

export function SendSmsPopup({ smsDialog, customer, toggleDialog }: SendSmsPopupProps) {
  const { postSecure } = useSecureCalls()

  const [type, setType] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (!smsDialog) return null

  const customerName = customer.raw
    ? `${customer.raw.first_name} ${customer.raw.last_name}`
    : `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim()

  const sendMessage = async () => {
    if (!type) {
      alert('Please select a message type')
      return
    }
    if (type === 'email' && !subject.trim()) {
      alert('Please fill out the required fields')
      return
    }
    if (!message.trim()) {
      alert('Please fill out the required fields')
      return
    }
    setLoading(true)
    try {
      await postSecure(SECURE_ENDPOINTS.CUSTOMER_SEND_MSG, {
        customer_ids: [customer.id],
        type,
        message,
        subject: subject || null,
      })
      toggleDialog(null)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Could not send message'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b">
          <h3 className="text-base font-semibold" style={{ whiteSpace: 'normal' }}>
            Send Message To {customerName}
          </h3>
        </div>
        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Type</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={type}
              onChange={e => {
                const val = e.target.value
                setType(val)
                if (val === 'sms') setSubject('')
              }}
            >
              <option value="">Select Type</option>
              {MESSAGE_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.text}</option>
              ))}
            </select>
          </div>

          {type === 'email' && (
            <div>
              <label className="block text-sm font-medium mb-1">Subject *</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Content *</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              rows={4}
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="px-6 py-4 flex justify-end gap-2 border-t">
          <button
            onClick={sendMessage}
            disabled={loading}
            className="bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
          <button
            onClick={() => toggleDialog(null)}
            disabled={loading}
            className="bg-red-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
