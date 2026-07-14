'use client'

import { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

export type ConfigDialogType = 'gtag' | 'pixel' | 'toggle' | 'gtag_property_steps'

interface Props {
  open: boolean
  type: ConfigDialogType | null
  initialData: unknown
  field: string | null
  message: string
  gtagPropertySteps: string[]
  onClose: () => void
  onSaved: () => void
}

const GTAG_REGEX = /^(G-[A-Z0-9]{8,10}|UA-\d{4,9}-\d{1,4}|AW-\d{8,10})$/
const PIXEL_REGEX = /^\d{15,16}$/

const DIALOG_TITLES: Record<string, string> = {
  gtag: 'Configure Google Analytics (GTag)',
  pixel: 'Configure Meta Pixel',
  toggle: 'Configure Setting',
  gtag_property_steps: 'Configure GTag Property',
}

const TOGGLE_LABELS: Record<string, string> = {
  recaptcha_enabled: 'Enable reCAPTCHA',
  pwa_enabled: 'Enable Progressive Web App (PWA)',
  gmb_ai_post: 'Enable Google My Business AI Posting',
  is_analytics_enabled: 'Enable Abbi Analytics',
}

function normalizeArrayData(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').map(item => item.trim()).filter(Boolean)
  }
  return []
}

export function DashboardConfigDialogue({
  open, type, initialData, field, message, gtagPropertySteps, onClose, onSaved,
}: Props) {
  const organization = useOrgStore(s => s.organization)
  const { putSecure } = useSecureCalls()

  const [values, setValues] = useState<string[]>([])
  const [inputValue, setInputValue] = useState('')
  const [toggleValue, setToggleValue] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setValidationError('')
    setInputValue('')
    if (type === 'gtag' || type === 'pixel') {
      setValues(normalizeArrayData(initialData))
    } else if (type === 'toggle') {
      setToggleValue(typeof initialData === 'boolean' ? initialData : false)
    }
  }, [open, type, initialData])

  const validate = useCallback((list: string[]): string => {
    if (type === 'gtag') {
      if (!list.length) return 'GTag is required'
      if (list.some(v => !GTAG_REGEX.test(v))) {
        return 'Each gtag must match format: G-XXXXXXXXXX or UA-XXXXXXXXX-X or AW-XXXXXXXXX'
      }
    }
    if (type === 'pixel') {
      if (!list.length) return 'Pixel is required'
      if (list.some(v => !PIXEL_REGEX.test(v))) {
        return 'Each Pixel value must be 15 or 16 digits'
      }
    }
    return ''
  }, [type])

  const addValue = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    if (!values.includes(trimmed)) {
      const next = [...values, trimmed]
      setValues(next)
      setValidationError(validate(next))
    }
    setInputValue('')
  }

  const removeValue = (value: string) => {
    const next = values.filter(v => v !== value)
    setValues(next)
    setValidationError(validate(next))
  }

  const handleSave = async () => {
    if (type === 'gtag_property_steps') {
      onClose()
      return
    }

    if (type !== 'toggle') {
      const error = validate(values)
      if (error) {
        setValidationError(error)
        toast.error('Please fix validation errors')
        return
      }
    }

    if (!organization?.id) {
      toast.error('Organization ID not found')
      return
    }

    setLoading(true)
    try {
      const data: Record<string, unknown> = { id: organization.id }
      if (type === 'gtag') data.gtag = values
      else if (type === 'pixel') data.pixel = values
      else if (type === 'toggle') {
        if (!field) {
          toast.error('Field name is required')
          setLoading(false)
          return
        }
        data[field] = toggleValue
      }

      await putSecure(SECURE_ENDPOINTS.ORGANIZATION, data)

      const successMessages: Record<string, string> = {
        gtag: 'Google Analytics (GTag) configured successfully',
        pixel: 'Meta Pixel configured successfully',
        toggle: 'Setting updated successfully',
      }
      toast.success(successMessages[type ?? ''] || 'Configuration saved successfully', { duration: 5000 })
      onSaved()
      onClose()
    } catch (error) {
      console.error(`Error saving ${type} config:`, error)
      toast.error('Failed to save configuration')
    } finally {
      setLoading(false)
    }
  }

  if (!open || !type) return null

  const hint = type === 'gtag'
    ? 'Format: G-XXXXXXXXXX, UA-XXXXXXXXX-X, or AW-XXXXXXXXX'
    : 'Each Pixel value must be 15 or 16 digits'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg w-full max-w-[600px] shadow-xl">
        <div className="flex justify-between items-center p-4 pb-2">
          <span className="text-lg font-semibold">{DIALOG_TITLES[type]}</span>
          <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pb-2">
          {(type === 'gtag' || type === 'pixel') && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {type === 'gtag' ? 'GTag IDs' : 'Pixel IDs'}
              </label>
              <div className={`border rounded px-2 py-2 flex flex-wrap gap-2 ${validationError ? 'border-red-500' : 'border-gray-300'}`}>
                {values.map(v => (
                  <span key={v} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm rounded-full px-3 py-1">
                    {v}
                    <button type="button" onClick={() => removeValue(v)} className="text-gray-500 hover:text-gray-700" aria-label={`Remove ${v}`}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="flex-1 min-w-[140px] outline-none text-sm py-1"
                  placeholder="Type a value and press Enter"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      addValue()
                    } else if (e.key === 'Backspace' && !inputValue && values.length) {
                      removeValue(values[values.length - 1])
                    }
                  }}
                  onBlur={addValue}
                />
              </div>
              <p className={`text-xs mt-1 ${validationError ? 'text-red-600' : 'text-gray-500'}`}>
                {validationError || hint}
              </p>
            </div>
          )}

          {type === 'toggle' && (
            <div>
              <p className="mb-4 text-sm text-gray-700">{message}</p>
              <label className="flex items-center gap-3 mt-4 cursor-pointer select-none">
                <button
                  type="button"
                  role="switch"
                  aria-checked={toggleValue}
                  onClick={() => setToggleValue(v => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${toggleValue ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${toggleValue ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm text-gray-700">{TOGGLE_LABELS[field ?? ''] || 'Enable Setting'}</span>
              </label>
            </div>
          )}

          {type === 'gtag_property_steps' && (
            <div>
              <div className="text-sm text-gray-500 mb-4">
                Follow these steps to configure your GTag Property:
              </div>
              <ul>
                {gtagPropertySteps.map((step, index) => (
                  <li key={index} className="flex items-center gap-3 py-2">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-base text-gray-800">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-4 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-50 rounded">
            {type === 'gtag_property_steps' ? 'Got it' : 'Cancel'}
          </button>
          {type !== 'gtag_property_steps' && (
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
