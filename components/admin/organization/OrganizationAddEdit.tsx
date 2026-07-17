'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { toast } from 'sonner'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { useContentBuilder } from '@/hooks/admin/useContentBuilder'
import { buildMediaUrl } from '@/lib/utils/media'
import { ImageSelector } from '@/components/ImageSelector'

interface MediaItem { uuid: string; name: string; extension: string }

const INDUSTRY_CHOICES = [
  { title: 'Fitness Center', key: 'fitness_center' },
  { title: 'Salon', key: 'salon' },
  { title: 'Junk Removal', key: 'junk_removal' },
  { title: 'Accounting', key: 'accounting' },
  { title: 'Cosmetic Center', key: 'cosmetic_center' },
]

// Same IANA list as Nuxt OrgnizationAddEdit.vue.
const TIMEZONES = [
  'Africa/Abidjan', 'Africa/Accra', 'Africa/Algiers', 'Africa/Bissau', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta', 'Africa/El_Aaiun',
  'Africa/Johannesburg', 'Africa/Juba', 'Africa/Khartoum', 'Africa/Lagos', 'Africa/Maputo', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena',
  'Africa/Sao_Tome', 'Africa/Tripoli', 'Africa/Tunis', 'Africa/Windhoek', 'America/Adak', 'America/Anchorage', 'America/Argentina/Buenos_Aires',
  'America/Argentina/Catamarca', 'America/Argentina/Cordoba', 'America/Argentina/Jujuy', 'America/Argentina/La_Rioja', 'America/Argentina/Mendoza',
  'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan', 'America/Argentina/San_Luis', 'America/Argentina/Tucuman',
  'America/Argentina/Ushuaia', 'America/Araguaina', 'America/Asuncion', 'America/Atikokan', 'America/Bahia', 'America/Bahia_Banderas', 'America/Barbados',
  'America/Belem', 'America/Belize', 'America/Blanc-Sablon', 'America/Boa_Vista', 'America/Boise', 'America/Bogota', 'America/Cambridge_Bay',
  'America/Campo_Grande', 'America/Cancun', 'America/Caracas', 'America/Cayenne', 'America/Chicago', 'America/Chihuahua', 'America/Costa_Rica',
  'America/Creston', 'America/Curacao', 'America/Danmarkshavn', 'America/Dawson', 'America/Dawson_Creek', 'America/Denver', 'America/Detroit',
  'America/Dominica', 'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador', 'America/Fort_Nelson', 'America/Fortaleza', 'America/Glace_Bay',
  'America/Godthab', 'America/Goose_Bay', 'America/Grand_Turk', 'America/Guatemala', 'America/Guayaquil', 'America/Guyana', 'America/Halifax',
  'America/Havana', 'America/Hermosillo', 'America/Indiana/Indianapolis', 'America/Indiana/Knox', 'America/Indiana/Marengo', 'America/Indiana/Petersburg',
  'America/Indiana/Tell_City', 'America/Indiana/Vevay', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Inuvik', 'America/Iqaluit',
  'America/Jamaica', 'America/Juneau', 'America/Kentucky/Louisville', 'America/Kentucky/Monticello', 'America/La_Paz', 'America/Lima', 'America/Los_Angeles',
  'America/Maceio', 'America/Managua', 'America/Manaus', 'America/Marigot', 'America/Martinique', 'America/Matamoros', 'America/Mazatlan', 'America/Menominee',
  'America/Merida', 'America/Metlakatla', 'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey', 'America/Montevideo',
  'America/Nassau', 'America/New_York', 'America/Nipigon', 'America/Nome', 'America/Noronha', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center',
  'America/North_Dakota/New_Salem', 'America/Ojinaga', 'America/Panama', 'America/Pangnirtung', 'America/Paramaribo', 'America/Phoenix', 'America/Port-au-Prince',
  'America/Port_of_Spain', 'America/Porto_Velho', 'America/Puerto_Rico', 'America/Punta_Arenas', 'America/Rainy_River', 'America/Rankin_Inlet', 'America/Recife',
  'America/Regina', 'America/Resolute', 'America/Rio_Branco', 'America/Santarem', 'America/Santiago', 'America/Santo_Domingo', 'America/Sao_Paulo',
  'America/Scoresbysund', 'America/Sitka', 'America/St_Johns', 'America/Swift_Current', 'America/Tegucigalpa', 'America/Thule', 'America/Thunder_Bay',
  'America/Tijuana', 'America/Toronto', 'America/Vancouver', 'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat', 'America/Yellowknife',
  'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville', 'Antarctica/Macquarie', 'Antarctica/Mawson', 'Antarctica/Palmer', 'Antarctica/Rothera',
  'Antarctica/Syowa', 'Antarctica/Troll', 'Antarctica/Vostok', 'Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Ashgabat', 'Asia/Baghdad', 'Asia/Baku', 'Asia/Bangkok',
  'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Choibalsan', 'Asia/Chita', 'Asia/Colombo', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili', 'Asia/Dubai',
  'Asia/Dushanbe', 'Asia/Famagusta', 'Asia/Gaza', 'Asia/Hebron', 'Asia/Ho_Chi_Minh', 'Asia/Hong_Kong', 'Asia/Hovd', 'Asia/Irkutsk', 'Asia/Jakarta',
  'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Kamchatka', 'Asia/Karachi', 'Asia/Kathmandu', 'Asia/Khandyga', 'Asia/Kolkata', 'Asia/Krasnoyarsk',
  'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar', 'Asia/Manila', 'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk',
  'Asia/Omsk', 'Asia/Oral', 'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qostanay', 'Asia/Qyzylorda', 'Asia/Riyadh', 'Asia/Sakhalin',
  'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi', 'Asia/Tehran',
  'Asia/Thimphu', 'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ulaanbaatar', 'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yangon',
  'Asia/Yekaterinburg', 'Asia/Yerevan', 'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Cape_Verde', 'Atlantic/Canary', 'Atlantic/Faroe', 'Atlantic/Madeira',
  'Atlantic/Reykjavik', 'Atlantic/South_Georgia', 'Atlantic/Stanley', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill', 'Australia/Currie',
  'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman', 'Australia/Lord_Howe', 'Australia/Melbourne', 'Australia/Perth',
  'Australia/Sydney', 'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens', 'Europe/Belgrade', 'Europe/Berlin', 'Europe/Brussels',
  'Europe/Bucharest', 'Europe/Budapest', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Gibraltar', 'Europe/Helsinki', 'Europe/Istanbul',
  'Europe/Kaliningrad', 'Europe/Kiev', 'Europe/Kirov', 'Europe/Lisbon', 'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Minsk',
  'Europe/Monaco', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Prague', 'Europe/Riga', 'Europe/Rome', 'Europe/Samara', 'Europe/Saratov',
  'Europe/Simferopol', 'Europe/Sofia', 'Europe/Stockholm', 'Europe/Tallinn', 'Europe/Tirane', 'Europe/Ulyanovsk', 'Europe/Uzhgorod', 'Europe/Vienna',
  'Europe/Vilnius', 'Europe/Volgograd', 'Europe/Warsaw', 'Europe/Zaporozhye', 'Europe/Zurich', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos',
  'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives', 'Indian/Mauritius', 'Indian/Reunion', 'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville',
  'Pacific/Chatham', 'Pacific/Chuuk', 'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo', 'Pacific/Fiji', 'Pacific/Funafuti',
  'Pacific/Galapagos', 'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein',
  'Pacific/Majuro', 'Pacific/Marquesas', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk', 'Pacific/Noumea', 'Pacific/Palau', 'Pacific/Pago_Pago',
  'Pacific/Pitcairn', 'Pacific/Pohnpei', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Tahiti', 'Pacific/Tarawa', 'Pacific/Tongatapu', 'Pacific/Wake',
  'Pacific/Wallis',
]

const FIELD = 'w-full rounded-md border border-gray-300 bg-[#f5f5f8] px-3.5 py-2.5 text-base focus:border-[#124e66] focus:outline-none focus:ring-1 focus:ring-[#124e66]'
const LABEL = 'block text-sm font-medium mb-1.5 text-gray-700'

export function OrganizationAddEdit() {
  const { getSecure, putSecure } = useSecureCalls()
  const { fetchMediaByOrganization, baseImageUrl } = useContentBuilder()

  const [orgId, setOrgId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [schoolType, setSchoolType] = useState('')
  const [domain, setDomain] = useState('')
  const [timezone, setTimezone] = useState('')
  const [industryType, setIndustryType] = useState('')
  const [logo, setLogo] = useState<string>('')
  const [medias, setMedias] = useState<MediaItem[]>([])
  const [overlay, setOverlay] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetchMediaByOrganization()
      setMedias(Array.isArray(res) ? (res as MediaItem[]) : [])
    } catch { /* ignore */ }
  }, [fetchMediaByOrganization])

  useEffect(() => {
    ;(async () => {
      setOverlay(true)
      try {
        await fetchMedia()
        const data = await getSecure<any[]>(SECURE_ENDPOINTS.ORGANIZATION)
        const org = Array.isArray(data) ? data[0] : data
        if (org) {
          setOrgId(org.id)
          setName(org.name ?? '')
          setDomain(org.domain ?? '')
          setSchoolType(org.school_type ?? '')
          setTimezone(org.timezone ?? '')
          setIndustryType(org.industry_type ?? '')
          setLogo(org.primary_logo ?? '')
        }
      } catch { /* handled */ } finally {
        setOverlay(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const logoPreview = useMemo(() => {
    if (!logo) return ''
    const m = medias.find((x) => x.uuid === logo)
    if (m) return buildMediaUrl(m as any, 700)
    return `${baseImageUrl}/${logo}_700.png`
  }, [logo, medias, baseImageUrl])

  const updateOrganization = async () => {
    if (!name.trim() || !schoolType.trim() || !domain.trim()) {
      toast.error('Organization could not updated', { duration: 15000 })
      return
    }
    setSaving(true)
    try {
      await putSecure(SECURE_ENDPOINTS.ORGANIZATION, {
        id: orgId,
        name,
        school_type: schoolType,
        domain,
        timezone,
        industry_type: industryType,
        primary_logo: logo,
      })
      toast.success('Organization Updated Successfully', { duration: 15000 })
    } catch {
      toast.error('Organization could not updated', { duration: 15000 })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 md:p-6">
      {overlay && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#124e66] border-t-transparent" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 md:grid-cols-2">
        <div>
          <label className={LABEL}>Name</label>
          <input className={FIELD} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className={LABEL}>School Type</label>
          <input className={FIELD} value={schoolType} onChange={(e) => setSchoolType(e.target.value)} />
        </div>
        <div>
          <label className={LABEL}>Domain</label>
          <input className={FIELD} value={domain} onChange={(e) => setDomain(e.target.value)} />
        </div>
        <div>
          <label className={LABEL}>Time Zone</label>
          <select className={FIELD} value={timezone} onChange={(e) => setTimezone(e.target.value)}>
            <option value="">Select Time Zone</option>
            {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
          </select>
        </div>
        <div>
          <label className={LABEL}>Industry Type</label>
          <select className={FIELD} value={industryType} onChange={(e) => setIndustryType(e.target.value)}>
            <option value="">Select Industry Type</option>
            {INDUSTRY_CHOICES.map((c) => <option key={c.key} value={c.key}>{c.title}</option>)}
          </select>
        </div>

        {/* School Logo */}
        <div>
          <label className={LABEL}>School Logo</label>
          <div className="flex items-center gap-4 rounded border border-[#c4c4c4] p-3">
            <div className="flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin-only preview; matches ImageSelector thumbs
                <img src={logoPreview} alt="School Logo" className="max-h-full max-w-full object-contain" />
              ) : (
                <span className="text-center text-xs text-gray-400">No logo</span>
              )}
            </div>
            <ImageSelector
              medias={medias}
              preSelected={logo}
              onImageSelected={(uuid: string) => setLogo(uuid)}
              refreshMedia={fetchMedia}
              isUploader
              buttonText="Select Logo"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center md:justify-end">
        <button
          onClick={updateOrganization}
          disabled={saving}
          className="rounded bg-[#124e66] px-6 py-2.5 font-medium text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Organization'}
        </button>
      </div>
    </div>
  )
}
