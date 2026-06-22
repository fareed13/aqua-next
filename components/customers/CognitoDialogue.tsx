'use client'

import { useState, useEffect } from 'react'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useOrgStore } from '@/store/orgStore'

interface Contact {
  id: number
  first_name: string
  last_name: string
  email: string
  [key: string]: unknown
}

interface CognitoDialogueProps {
  contact: Contact | null
  cognitoDialog: boolean
  togglePopup: (val: boolean) => void
}

export function CognitoDialogue({ contact, cognitoDialog, togglePopup }: CognitoDialogueProps) {
  const { putSecure } = useSecureCalls()
  const orgStore = useOrgStore()

  const [resetPassword, setResetPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (!cognitoDialog) return null

  const createCredentials = async () => {
    if (!contact) return
    setLoading(true)
    try {
      await putSecure(SECURE_ENDPOINTS.CUSTOMER_USER, {
        email: contact.email,
        contact_id: contact.id,
        password: resetPassword,
        location_id: (orgStore as any)?.location?.id,
      })
      togglePopup(false)
    } catch (err) {
      console.error(err)
      togglePopup(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg w-full max-w-lg mx-4">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Update login credentials for{' '}
            {contact ? `${contact.first_name} ${contact.last_name}` : ''}
          </h2>
        </div>
        <div className="px-6 py-4">
          <label className="block text-sm font-medium mb-1">New Password *</label>
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            value={resetPassword}
            onChange={e => setResetPassword(e.target.value)}
            required
          />
        </div>
        <div className="px-6 py-4 flex justify-end gap-2 border-t">
          <button
            onClick={() => togglePopup(false)}
            className="px-4 py-2 rounded text-blue-700 font-medium hover:bg-blue-50"
          >
            Close
          </button>
          <button
            onClick={createCredentials}
            disabled={loading}
            className="px-4 py-2 rounded text-blue-700 font-medium hover:bg-blue-50 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
