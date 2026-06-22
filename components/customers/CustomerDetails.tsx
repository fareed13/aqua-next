// @ts-nocheck
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSecureCalls, SECURE_ENDPOINTS, NON_SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useOrgStore } from '@/store/orgStore'
import { CognitoDialogue } from './CognitoDialogue'

interface Contact {
  id: number
  first_name: string
  last_name: string
  middle_name?: string
  street?: string
  state?: number
  zipcode?: string
  city?: string
  phone?: string
  custom_field?: string
  reason_for_joining?: string
  email?: string
  birthday?: string
  parent?: number
  parent_relationship?: string
  tags?: Tag[]
  do_not_contact?: boolean
  enable_referrals?: boolean
  barcode?: string
  cookie?: Record<string, string>
  [key: string]: unknown
}

interface Tag {
  id: number
  name: string
}

interface State {
  id: number
  name: string
}

interface CustomerDetailsProps {
  contact?: Contact | null
  allContacts?: Contact[]
}

const RELATION_CHOICES = [
  { text: 'Related', value: 'related' },
  { text: 'Parent', value: 'parent' },
  { text: 'Grand Parent', value: 'grandparent' },
]

const ACTION_OPTIONS = [
  { name: 'Send user a new password', id: 1 },
]

export function CustomerDetails({ contact, allContacts = [] }: CustomerDetailsProps) {
  const router = useRouter()
  const { getSecure, putSecure, postSecure } = useSecureCalls()
  const { getNonSecure } = useSecureCalls() as any
  const orgStore = useOrgStore() as any

  const [loading, setLoading] = useState(false)
  const [states, setStates] = useState<State[]>([])
  const [tagsList, setTagsList] = useState<Tag[]>([])
  const [cognitoDialog, setCognitoDialog] = useState(false)
  const [customerAction, setCustomerAction] = useState<number | null>(null)

  // Form fields
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [street, setStreet] = useState('')
  const [stateId, setStateId] = useState<number | null>(null)
  const [zipcode, setZipcode] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [customField, setCustomField] = useState('')
  const [reasonForJoining, setReasonForJoining] = useState('')
  const [email, setEmail] = useState('')
  const [birthday, setBirthday] = useState('')
  const [parentId, setParentId] = useState<number | null>(null)
  const [parentRelationship, setParentRelationship] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [doNotContact, setDoNotContact] = useState(false)
  const [enableReferrals, setEnableReferrals] = useState(false)
  const [barcode, setBarcode] = useState('')
  const [isRelated, setIsRelated] = useState(false)
  const [contactSearch, setContactSearch] = useState('')

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        // Fetch states via non-secure
        const statesRes = await (getSecure as any)(NON_SECURE_ENDPOINTS.PUBLIC_STATE, { country: 'US' })
        setStates(Array.isArray(statesRes) ? statesRes : statesRes?.results ?? [])
        const tagsRes = await getSecure<any>(SECURE_ENDPOINTS.TAGS)
        setTagsList(Array.isArray(tagsRes) ? tagsRes : tagsRes?.results ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (contact) {
      setFirstName(contact.first_name ?? '')
      setLastName(contact.last_name ?? '')
      setMiddleName(contact.middle_name ?? '')
      setStreet(contact.street ?? '')
      setStateId(contact.state ?? null)
      setZipcode(contact.zipcode ?? '')
      setCity(contact.city ?? '')
      setPhone(contact.phone ?? '')
      setCustomField(contact.custom_field ?? '')
      setReasonForJoining(contact.reason_for_joining ?? '')
      setEmail(contact.email ?? '')
      setBirthday(contact.birthday ?? '')
      setParentId(contact.parent ?? null)
      setParentRelationship(contact.parent_relationship ?? '')
      setTags(contact.tags ?? [])
      setDoNotContact(contact.do_not_contact ?? false)
      setEnableReferrals(contact.enable_referrals ?? false)
      setBarcode(contact.barcode ?? '')
      setIsRelated(!!contact.parent)
    }
  }, [contact])

  const filteredContacts = useMemo(() => {
    const results = allContacts
      .filter(c => c.email != null)
      .sort((a, b) => a.first_name.localeCompare(b.first_name))
    return [{ id: null as any, first_name: 'None', last_name: '' }, ...results]
  }, [allContacts])

  const searchedContacts = useMemo(() => {
    if (!contactSearch) return filteredContacts
    const q = contactSearch.toLowerCase()
    return filteredContacts.filter(c =>
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(q)
    )
  }, [filteredContacts, contactSearch])

  const validate = () => {
    const required = isRelated
      ? [firstName, lastName, street, zipcode, city, phone]
      : [firstName, lastName, street, zipcode, city, phone, email]
    return required.every(v => v && v.trim())
  }

  const update = async () => {
    if (isRelated && (!parentRelationship || !parentId)) {
      alert('Please select related contact and its relationship.')
      return
    }
    if (!validate()) {
      alert('Please fill out the required fields')
      return
    }
    try {
      await putSecure(SECURE_ENDPOINTS.CUSTOMER, {
        id: contact!.id,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        street,
        state_id: stateId,
        zipcode,
        city,
        phone,
        custom_field: customField,
        reason_for_joining: reasonForJoining,
        email,
        birthday: birthday ? new Date(birthday).toISOString() : null,
        parent: parentId,
        parent_relationship: parentRelationship,
        tags,
        do_not_contact: doNotContact,
        enable_referrals: enableReferrals,
        barcode,
      })
      router.push('/customers')
    } catch (error) {
      console.error(error)
    }
  }

  const create = async () => {
    if (isRelated && (!parentRelationship || !parentId)) {
      alert('Please select related contact and its relationship.')
      return
    }
    if (!validate()) {
      alert('Please fill out the required fields')
      return
    }
    try {
      await postSecure(SECURE_ENDPOINTS.CUSTOMER, {
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        street,
        state_id: stateId,
        zipcode,
        city,
        phone,
        custom_field: customField,
        reason_for_joining: reasonForJoining,
        email,
        birthday: birthday ? new Date(birthday).toISOString() : null,
        parent: parentId,
        parent_relationship: parentRelationship,
        tags,
        do_not_contact: doNotContact,
        enable_referrals: enableReferrals,
        location_id: orgStore?.location?.id,
        barcode,
        lead_origin: 'non-digital',
      })
      router.push('/customers')
    } catch (error) {
      console.error(error)
    }
  }

  const applyCustomerAction = () => {
    if (!customerAction) {
      alert('Please select an action to apply.')
      return
    }
    if (customerAction === 1) {
      setCognitoDialog(true)
    }
  }

  return (
    <div className="p-4">
      <CognitoDialogue
        contact={contact ?? null}
        cognitoDialog={cognitoDialog}
        togglePopup={val => setCognitoDialog(val)}
      />

      {contact && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h1 className="text-lg font-bold">{contact ? 'Edit' : 'Add'} customer</h1>
          <div className="flex gap-2">
            <select
              className="border rounded px-3 py-2 bg-gray-50"
              value={customerAction ?? ''}
              onChange={e => setCustomerAction(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Select an action</option>
              {ACTION_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
            <button onClick={applyCustomerAction} className="bg-black text-white px-4 py-2 rounded text-sm">Apply</button>
          </div>
        </div>
      )}

      <hr className="mb-6" />

      <form onSubmit={e => e.preventDefault()} className="space-y-4 mt-6">
        {/* Family member section */}
        <div className="flex flex-wrap gap-4 items-start">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isRelated} onChange={e => setIsRelated(e.target.checked)} className="accent-red-500 w-4 h-4" />
            <span className="text-sm">Does this contact have a family member at the school?</span>
          </label>

          <div>
            <label className="block text-xs font-medium mb-1">Related Contact</label>
            <input
              type="text"
              placeholder="Search contacts..."
              className="border rounded px-3 py-2 text-sm mb-1 w-48"
              value={contactSearch}
              onChange={e => setContactSearch(e.target.value)}
              disabled={!isRelated}
            />
            <select
              className="border rounded px-3 py-2 bg-gray-50 w-48"
              value={parentId ?? ''}
              onChange={e => setParentId(e.target.value ? Number(e.target.value) : null)}
              disabled={!isRelated}
            >
              <option value="">None</option>
              {searchedContacts.filter(c => c.id != null).map(c => (
                <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1">Relationship with parent</label>
            <select
              className="border rounded px-3 py-2 bg-gray-50 w-48"
              value={parentRelationship}
              onChange={e => setParentRelationship(e.target.value)}
              disabled={!isRelated}
            >
              <option value="">Select relationship</option>
              {RELATION_CHOICES.map(r => <option key={r.value} value={r.value}>{r.text}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">First name *</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-50" value={firstName} onChange={e => setFirstName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last name *</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-50" value={lastName} onChange={e => setLastName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Middle name</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-50" value={middleName} onChange={e => setMiddleName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Street *</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-50" value={street} onChange={e => setStreet(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ZIP *</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-50" value={zipcode} onChange={e => setZipcode(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-50" value={city} onChange={e => setCity(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State</label>
              <select className="w-full border rounded px-3 py-2 bg-gray-50" value={stateId ?? ''} onChange={e => setStateId(e.target.value ? Number(e.target.value) : null)}>
                <option value="">Select State</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input type="tel" className="w-full border rounded px-3 py-2 bg-gray-50" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
            {(orgStore?.organization?.show_custom_field) && (
              <div>
                <label className="block text-sm font-medium mb-1">{orgStore?.organization?.customer_custom_field || 'Custom Field'}</label>
                <input type="text" className="w-full border rounded px-3 py-2 bg-gray-50" value={customField} onChange={e => setCustomField(e.target.value)} />
              </div>
            )}
            {(orgStore?.organization?.show_reason_for_joining) && (
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Joining</label>
                <input type="text" className="w-full border rounded px-3 py-2 bg-gray-50" value={reasonForJoining} onChange={e => setReasonForJoining(e.target.value)} />
              </div>
            )}
            {!isRelated && (
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input type="email" className="w-full border rounded px-3 py-2 bg-gray-50" value={email} onChange={e => setEmail(e.target.value.toLowerCase())} required={!isRelated} />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Birthday</label>
              <input type="date" className="w-full border rounded px-3 py-2 bg-gray-50" value={birthday} onChange={e => setBirthday(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Select Tags</label>
              <select
                multiple
                className="w-full border rounded px-3 py-2 bg-gray-50 h-24"
                value={tags.map(t => String(t.id))}
                onChange={e => {
                  const selected = Array.from(e.target.selectedOptions).map(o => Number(o.value))
                  setTags(tagsList.filter(t => selected.includes(t.id)))
                }}
              >
                {tagsList.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Barcode</label>
              <input type="text" className="w-full border rounded px-3 py-2 bg-gray-50" value={barcode} onChange={e => setBarcode(e.target.value)} />
            </div>
            <div className="flex gap-6 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={doNotContact} onChange={e => setDoNotContact(e.target.checked)} className="accent-red-500 w-4 h-4" />
                <span className="text-sm">Do not contact</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={enableReferrals} onChange={e => setEnableReferrals(e.target.checked)} className="accent-green-500 w-4 h-4" />
                <span className="text-sm">Enable Referrals</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          {contact ? (
            <button type="button" onClick={update} className="bg-[#124e66] text-white px-6 py-2 rounded font-semibold">Update</button>
          ) : (
            <button type="button" onClick={create} className="bg-[#ff0065] text-white px-6 py-2 rounded font-semibold">Create</button>
          )}
          <button type="button" onClick={() => router.push('/customers')} className="bg-gray-600 text-white px-6 py-2 rounded font-semibold">Cancel</button>
        </div>
      </form>
    </div>
  )
}
