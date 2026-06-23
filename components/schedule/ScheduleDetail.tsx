'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { useAuth } from '@/hooks/useAuth'
import { useSecureCalls, SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'
import { VideoPlayer } from '@/components/media/VideoPlayer'
import { formatDate, isoWeekday, setIsoWeekday, addDays } from '@/lib/utils/dateTime'
import type { Schedule } from '@/types/api'

const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
const VIDEO_URL = process.env.NEXT_PUBLIC_VIDEO_URL ?? MEDIA_URL

const DAYS_MAPPING: Record<string, number> = {
  Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4,
  Friday: 5, Saturday: 6, Sunday: 7,
}

interface ScheduleDetailProps {
  classId: string
  locationId: string
  slug: string
}

export function ScheduleDetail({ classId, locationId, slug }: ScheduleDetailProps) {
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const locations = useOrgStore(s => s.locations)
  const { isMemberLoggedIn, getUser, isLoggedIn } = useAuth()
  const { postSecure } = useSecureCalls()
  const requireLogin = organization?.require_login_for_virtual_classes ?? false

  const classData = useMemo(() => {
    const loc = locations.find(l => l.id === Number(locationId))
    if (!loc) return null
    const dayNames = Object.keys(DAYS_MAPPING)
    for (const day of dayNames) {
      const schedules = loc.day_schedules?.[day] ?? []
      const found = schedules.find((s: Schedule) => String(s.id) === classId)
      if (found) return found
    }
    return null
  }, [locations, locationId, classId])

  const [isReady, setIsReady] = useState(false)

  useEffect(() => { setIsReady(true) }, [])

  const deadline = useMemo(() => {
    if (!classData) return ''
    const classDay = DAYS_MAPPING[classData.day_of_week]
    const today = isoWeekday()
    let classDate: Date
    if (today <= classDay) {
      classDate = setIsoWeekday(new Date(), classDay)
    } else {
      classDate = setIsoWeekday(addDays(new Date(), 7), classDay)
    }
    const [h, m, s] = classData.start_time.split(':').map(Number)
    const dt = new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), h, m, s || 0)
    return formatDate(dt, 'YYYY-MM-DD HH:mm:ss')
  }, [classData])

  const videoMedia = useMemo(() => {
    const mediaDetail = (classData as any)?.media_detail ?? classData?.media
    if (!mediaDetail?.uuid) return null
    return { name: `${VIDEO_URL}${mediaDetail.uuid}_700.mp4`, autoPlay: false }
  }, [classData])

  const zoomLogo = `${MEDIA_URL}/videoPlay_700.png`

  if (!classData) {
    router.push('/')
    return null
  }

  const onLogoClick = async () => {
    if (requireLogin) {
      if (isLoggedIn()) {
        const user = getUser()
        if (user?.id) {
          try {
            await postSecure(SECURE_ENDPOINTS.ATTENDANCE, {
              contact: String(user.id),
              schedule: classId,
            })
          } catch {}
        }
        if (classData.link) window.location.href = classData.link
      } else {
        router.push(`/login?redirect=/schedule/${slug}`)
      }
    } else {
      if (classData.link) window.location.href = classData.link
    }
  }

  return (
    <div>
      {/* Video section */}
      {videoMedia && (
        <div className="bg-[#f3f3f3] pt-[50px] text-center">
          <div className="max-w-6xl mx-auto px-4">
            <VideoPlayer component="VideoPlayer" media={videoMedia as any} />
          </div>
        </div>
      )}

      {/* Countdown & class info */}
      <div className="text-center py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="mb-3 text-2xl font-bold">Class Begins at:</h3>

          {isReady && (
            <div className="bg-gray-100 rounded-lg p-6 max-w-md mx-auto mb-6">
              <p className="text-lg font-mono">{deadline}</p>
            </div>
          )}

          <div className="my-6">
            <h2 className="text-4xl font-bold">{classData.pretty_start_time}</h2>
            <h4 className="text-2xl text-gray-600">{classData.day_of_week}s</h4>
          </div>

          <p className="mb-6">Click the logo below at the time above to join the class LIVE</p>

          <div className="max-w-[300px] mx-auto cursor-pointer" onClick={onLogoClick}>
            <Image
              src={zoomLogo}
              alt="Join class"
              width={300}
              height={300}
              className="w-full h-auto object-contain"
              loading="lazy"
            />
          </div>

          {!requireLogin && classData.link && (
            <p className="mt-5">Meeting ID {classData.link}</p>
          )}
        </div>
      </div>
    </div>
  )
}
