'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { MapPinPlus, Trash2, Plus, GripVertical } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { checkBase64, highlightBase64Images } from '@/lib/utils/base64ImgValidation'
import { DeleteWarning } from '@/components/warnings/DeleteWarning'
import { QuillEditor } from '@/components/QuillEditor'
import { TagsInput } from './TagsInput'
import { LocationAdd } from './LocationAdd'

interface StateOption { id: number; name: string }
interface LocationRow { id: number; city: string; [k: string]: any }
interface Hours { day: string; start: string; end: string }
interface HyperLink { name: string; link: string }

const TABS = ['General Settings', 'Location Lead Settings']
const CALL_ACTION_CHOICES = ['Secure Your First Class', 'Get Your #discount# Off Coupon', 'Get Started Now']
const DAYS = [
  { display: 'Monday', value: 'monday' }, { display: 'Tuesday', value: 'tuesday' },
  { display: 'Wednesday', value: 'wednesday' }, { display: 'Thursday', value: 'thursday' },
  { display: 'Friday', value: 'friday' }, { display: 'Saturday', value: 'saturday' },
  { display: 'Sunday', value: 'sunday' },
]

const FIELD = 'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'
const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'

export function LocationAddEdit() {
  const { getSecure, putSecure, deleteSecure } = useSecureCalls()
  const locations = useOrgStore((s) => s.locations) as unknown as LocationRow[]
  const primaryLocation = useOrgStore((s) => s.location)

  const [states, setStates] = useState<StateOption[]>([])
  const [locationList, setLocationList] = useState<LocationRow[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null)
  const [tab, setTab] = useState(0)
  const [overlay, setOverlay] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deletePopup, setDeletePopup] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  // form fields
  const [selectedState, setSelectedState] = useState<number | ''>('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [zip, setZip] = useState('')
  const [phone, setPhone] = useState('')
  const [secondaryPhone, setSecondaryPhone] = useState('')
  const [googlePlaceId, setGooglePlaceId] = useState('')
  const [abn, setAbn] = useState('')
  const [email, setEmail] = useState('')
  const [seoHeadline, setSeoHeadline] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [hours, setHours] = useState<Hours[]>([])
  const [links, setLinks] = useState<HyperLink[]>([])
  const [welcomeMessage, setWelcomeMessage] = useState('')
  const [targetLocations, setTargetLocations] = useState<string[]>([])
  const [twilioNumber, setTwilioNumber] = useState('')
  const [smsToNotify, setSmsToNotify] = useState<string[]>([])
  const [emailsToNotify, setEmailsToNotify] = useState<string[]>([])
  const [planOverride, setPlanOverride] = useState('')
  const [callToAction, setCallToAction] = useState('')

  const dragIndex = useRef<number | null>(null)

  const getStates = useCallback(async () => {
    try {
      const res = await getSecure<StateOption[]>(SECURE_ENDPOINTS.STATE)
      setStates(Array.isArray(res) ? res : [])
    } catch { /* ignore */ }
  }, [getSecure])

  const populate = useCallback((d: any) => {
    setWelcomeMessage(d.welcome_message ?? '')
    setStreet(d.street ?? '')
    setCity(d.city ?? '')
    setSelectedState(d.state ?? '')
    setZip(d.zip_code ?? '')
    setPhone(d.phone ?? '')
    setSecondaryPhone(d.secondary_phone ?? '')
    setGooglePlaceId(d.google_place_id ?? '')
    setTwilioNumber(d.twilio_number ?? '')
    setSmsToNotify(Array.isArray(d.sms_to_notify) ? d.sms_to_notify : [])
    setTargetLocations(Array.isArray(d.target_locations) ? d.target_locations : [])
    setEmailsToNotify(Array.isArray(d.emails_to_notify) ? d.emails_to_notify : [])
    setCallToAction(d.call_to_action ?? '')
    setPlanOverride(d.plan_override ?? '')
    setAbn(d.abn ?? '')
    setHours(Array.isArray(d.hours_of_operation) ? d.hours_of_operation : [])
    setLinks(Array.isArray(d.hyper_links) ? d.hyper_links : [])
    setSeoHeadline(d.seo_headline ?? '')
    setSeoDescription(d.seo_description ?? '')
    setEmail(d.email ?? '')
  }, [])

  const getLocation = useCallback(async (id: number) => {
    setOverlay(true)
    try {
      const res = await getSecure<any[]>(SECURE_ENDPOINTS.LOCATION, { id })
      if (Array.isArray(res) && res[0]) populate(res[0])
    } finally {
      setOverlay(false)
    }
  }, [getSecure, populate])

  useEffect(() => {
    ;(async () => {
      setOverlay(true)
      const list = locations ?? []
      setLocationList(list)
      await getStates()
      if (list.length > 0) {
        setSelectedLocationId(list[0].id)
        await getLocation(list[0].id)
      }
      setOverlay(false)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onSelectLocation = (id: number) => {
    setSelectedLocationId(id)
    getLocation(id)
  }

  const updateLocation = async () => {
    if (welcomeMessage && checkBase64(welcomeMessage)) {
      setWelcomeMessage(highlightBase64Images(welcomeMessage))
      return
    }
    // Nuxt validates phone on tab 0, target locations on tab 1.
    if (tab === 0 && !phone.trim()) {
      toast.error('Please fill out the required fields', { duration: 15000 })
      return
    }
    if (tab === 1 && targetLocations.length === 0) {
      toast.error('Please fill out the required fields', { duration: 15000 })
      return
    }
    setOverlay(true)
    setUpdating(true)
    try {
      await putSecure(SECURE_ENDPOINTS.LOCATION_SECURE, {
        state_id: selectedState,
        id: selectedLocationId,
        street, city, zip_code: zip, phone,
        secondary_phone: secondaryPhone,
        google_place_id: googlePlaceId,
        sms_to_notify: smsToNotify,
        twilio_number: twilioNumber,
        target_locations: targetLocations,
        emails_to_notify: emailsToNotify,
        call_to_action: callToAction,
        plan_override: planOverride,
        abn, email,
        seo_headline: seoHeadline,
        seo_description: seoDescription,
        hours_of_operation: hours,
        hyper_links: links,
        welcome_message: welcomeMessage,
      })
      toast.success('Location Updated Successfully', { duration: 15000 })
    } catch {
      toast.error('Location could not updated', { duration: 15000 })
    } finally {
      setOverlay(false)
      setUpdating(false)
    }
  }

  const deleteLocation = async () => {
    if (selectedLocationId === primaryLocation?.id) {
      toast.error('You cannot delete a primary location', { duration: 10000 })
      setDeletePopup(false)
      return
    }
    if (!selectedLocationId) return
    try {
      await deleteSecure(SECURE_ENDPOINTS.LOCATION, selectedLocationId)
      toast.success('Deleted successfully', { duration: 15000 })
      const remaining = locationList.filter((l) => l.id !== selectedLocationId)
      setLocationList(remaining)
      setDeletePopup(false)
      if (remaining.length) onSelectLocation(remaining[0].id)
    } catch {
      setDeletePopup(false)
    }
  }

  // hyper_links drag reorder (native, no dep — avoids the nested-scroll dnd issues)
  const onDrop = (to: number) => {
    const from = dragIndex.current
    dragIndex.current = null
    if (from === null || from === to) return
    setLinks((prev) => {
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const cityOptions = locationList.map((l) => l.city).filter(Boolean)

  return (
    <div className="rounded-lg bg-[#f8fafc]">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      {/* Header: location select + add/delete */}
      <div className="flex flex-col gap-3 rounded-t-lg bg-[#124e66] p-4 md:flex-row md:items-end md:justify-between">
        <div className="w-full md:max-w-xs">
          <label className="mb-1 block text-sm text-white/90">Select Location</label>
          <select
            value={selectedLocationId ?? ''}
            onChange={(e) => e.target.value && onSelectLocation(Number(e.target.value))}
            className="w-full rounded-md border border-white/20 bg-white px-3 py-2.5 text-base"
          >
            {locationList.map((l) => <option key={l.id} value={l.id}>{l.city}</option>)}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 rounded bg-white px-4 py-2.5 text-sm font-medium text-[#124e66]">
            <MapPinPlus size={18} /> Add Location
          </button>
          <button onClick={() => setDeletePopup(true)} className="flex items-center gap-2 rounded bg-red-600 px-4 py-2.5 text-sm font-medium text-white">
            <Trash2 size={18} /> Delete Location
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 overflow-x-auto border-b bg-white px-2 pt-2">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium ${tab === i ? 'border-b-2 border-[#124e66] text-[#124e66]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-white p-4 md:p-6">
        {/* ---------------- Tab 0: General Settings ---------------- */}
        {tab === 0 && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Location Details</h3>
              <p className="text-sm text-gray-500">Manage your location&apos;s basic information</p>
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <div>
                <label className={LABEL}>Select State</label>
                <select className={FIELD} value={selectedState} onChange={(e) => setSelectedState(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Select State</option>
                  {states.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div><label className={LABEL}>Street</label><input className={FIELD} value={street} onChange={(e) => setStreet(e.target.value)} /></div>
              <div><label className={LABEL}>City</label><input className={FIELD} value={city} onChange={(e) => setCity(e.target.value)} /></div>
              <div><label className={LABEL}>Zip</label><input className={FIELD} value={zip} onChange={(e) => setZip(e.target.value)} /></div>
              <div><label className={LABEL}>Phone *</label><input className={FIELD} value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
              <div><label className={LABEL}>Google Place ID</label><input className={FIELD} value={googlePlaceId} onChange={(e) => setGooglePlaceId(e.target.value)} /></div>
              <div><label className={LABEL}>Secondary Phone</label><input className={FIELD} value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} /></div>
              <div><label className={LABEL}>ABN</label><input className={FIELD} value={abn} onChange={(e) => setAbn(e.target.value)} /></div>
              <div><label className={LABEL}>Email *</label><input className={FIELD} value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            </div>

            <div className="mb-4 mt-6"><h3 className="text-lg font-semibold">SEO Information</h3><p className="text-sm text-gray-500">Optimize your location&apos;s search engine visibility</p></div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <div><label className={LABEL}>SEO Headline</label><input className={FIELD} value={seoHeadline} onChange={(e) => setSeoHeadline(e.target.value)} /></div>
              <div><label className={LABEL}>SEO Description</label><textarea rows={3} className={FIELD} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} /></div>
            </div>

            {/* Hours of Operation */}
            <div className="mb-4 mt-6 flex items-center justify-between">
              <div><h3 className="text-lg font-semibold">Hours of Operation</h3><p className="text-sm text-gray-500">Set your location&apos;s business hours</p></div>
              <button onClick={() => setHours((h) => [...h, { day: '', start: '', end: '' }])} className="flex items-center gap-1 rounded bg-[#124E66] px-3 py-2 text-sm text-white">
                <Plus size={16} /> Add Hours
              </button>
            </div>
            <div className="space-y-2">
              {hours.map((hop, i) => (
                <div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-12 sm:items-center">
                  <select className={`${FIELD} sm:col-span-4`} value={hop.day} onChange={(e) => setHours((h) => h.map((x, j) => j === i ? { ...x, day: e.target.value } : x))}>
                    <option value="">Day</option>
                    {DAYS.map((d) => <option key={d.value} value={d.value}>{d.display}</option>)}
                  </select>
                  <input type="time" className={`${FIELD} sm:col-span-3`} value={hop.start} onChange={(e) => setHours((h) => h.map((x, j) => j === i ? { ...x, start: e.target.value } : x))} />
                  <input type="time" className={`${FIELD} sm:col-span-3`} value={hop.end} onChange={(e) => setHours((h) => h.map((x, j) => j === i ? { ...x, end: e.target.value } : x))} />
                  <div className="sm:col-span-2">
                    <button onClick={() => setHours((h) => h.filter((_, j) => j !== i))} className="rounded border border-red-500 p-2 text-red-600" aria-label="Remove hours"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Links (drag to reorder) */}
            <div className="mb-4 mt-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Additional Links</h3>
              <button onClick={() => setLinks((l) => [...l, { name: '', link: '' }])} className="flex items-center gap-1 rounded bg-[#124E66] px-3 py-2 text-sm text-white">
                <Plus size={16} /> Add Link
              </button>
            </div>
            <div className="space-y-3">
              {links.map((lnk, i) => (
                <div
                  key={i}
                  draggable
                  onDragStart={() => { dragIndex.current = i }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(i)}
                  className="grid grid-cols-1 items-center gap-2 rounded-lg border border-gray-200 p-3 sm:grid-cols-12"
                >
                  <div className="flex items-center gap-2 sm:col-span-5">
                    <GripVertical size={18} className="shrink-0 cursor-grab text-gray-400" />
                    <input className={FIELD} placeholder="Name" value={lnk.name} onChange={(e) => setLinks((l) => l.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  </div>
                  <input className={`${FIELD} sm:col-span-5`} placeholder="Link" value={lnk.link} onChange={(e) => setLinks((l) => l.map((x, j) => j === i ? { ...x, link: e.target.value } : x))} />
                  <div className="flex justify-end sm:col-span-2">
                    <button onClick={() => setLinks((l) => l.filter((_, j) => j !== i))} className="rounded border border-red-500 p-2 text-red-600" aria-label="Remove link"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={updateLocation} disabled={updating} className="rounded bg-[#124e66] px-6 py-2.5 font-medium text-white disabled:opacity-50">
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}

        {/* ---------------- Tab 1: Location Lead Settings ---------------- */}
        {tab === 1 && (
          <div>
            <div className="mb-4">
              <h3 className="mb-2 text-lg font-semibold">Welcome Message</h3>
              <QuillEditor content={welcomeMessage} contentType="html" {...{ 'onUpdate:content': (html: string) => setWelcomeMessage(html) }} />
            </div>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
              <div>
                <label className={LABEL}>Target Locations *</label>
                <TagsInput values={targetLocations} onChange={setTargetLocations} suggestions={cityOptions} placeholder="Add a location…" />
              </div>
              <div><label className={LABEL}>Twilio Number</label><input className={FIELD} value={twilioNumber} onChange={(e) => setTwilioNumber(e.target.value)} /></div>
              <div>
                <label className={LABEL}>SMS Notifications</label>
                <TagsInput values={smsToNotify} onChange={setSmsToNotify} placeholder="Add a number…" />
              </div>
              <div>
                <label className={LABEL}>Email Notifications</label>
                <TagsInput values={emailsToNotify} onChange={setEmailsToNotify} placeholder="Add an email…" />
              </div>
              <div><label className={LABEL}>Plan Override</label><input className={FIELD} value={planOverride} onChange={(e) => setPlanOverride(e.target.value)} /></div>
              <div>
                <label className={LABEL}>Call To Action</label>
                <select className={FIELD} value={callToAction} onChange={(e) => setCallToAction(e.target.value)}>
                  <option value="">Select</option>
                  {CALL_ACTION_CHOICES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={updateLocation} disabled={updating} className="rounded bg-[#124e66] px-6 py-2.5 font-medium text-white disabled:opacity-50">
                {updating ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </div>

      <DeleteWarning
        popup={deletePopup}
        message="Do You Really want to delete this location?"
        loading={false}
        onConfirm={deleteLocation}
        onCancel={() => setDeletePopup(false)}
      />
      <LocationAdd
        open={addOpen}
        states={states}
        onClose={() => setAddOpen(false)}
        onCreated={() => { /* list refresh happens on next org hydrate */ }}
      />
    </div>
  )
}
