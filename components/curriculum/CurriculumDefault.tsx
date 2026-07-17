'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useAuth } from '@/hooks/useAuth'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Curriculum } from '@/types/api'

interface Props {
  curriculumList: Curriculum[]
}

export function CurriculumDefault({ curriculumList }: Props) {
  const organization = useOrgStore((s) => s.organization)
  const services = organization?.services ?? []
  const requiresLogin = organization?.require_login_for_virtual_classes ?? false
  const { isLoggedIn } = useAuth()

  // isLoggedIn() reads client-only auth; gate it behind mount so SSR and the first
  // client render agree (avoids a hydration mismatch on the button element). See
  // the auth-hydration guidance — before mount we render the logged-out variant.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const authed = mounted && isLoggedIn()

  const serviceNames = useMemo(() => {
    const names = new Set<string>()
    curriculumList.forEach((c) => { if (c.service?.name) names.add(c.service.name) })
    return ['all', ...Array.from(names)]
  }, [curriculumList])

  const [selectedService, setSelectedService] = useState('all')

  const filtered = useMemo(() => {
    return curriculumList
      .filter((c) => c.is_public && c.lessons?.length > 0)
      .filter((c) => selectedService === 'all' || c.service?.name === selectedService)
  }, [curriculumList, selectedService])

  function arrangeImage(serviceName: string): string {
    const svc = services.find((s) => s.name === serviceName)
    if (svc?.large_media) return buildMediaUrl(svc.large_media, 700)
    return ''
  }

  // Nuxt checkDisablity: only gate when login is required AND the user is NOT logged in.
  // A logged-in member always gets an enabled "View Class".
  function checkDisabled(curriculum: Curriculum, lesson: any): boolean {
    if (!requiresLogin || authed) return false
    if (curriculum.is_public) return !lesson.is_public
    return true
  }

  return (
    <div className="py-8 pb-8">
      <div className="max-w-[500px] mx-auto px-4 mb-6">
        <label className="block text-sm text-gray-600 mb-1">Select a class</label>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        >
          {serviceNames.map((name) => (
            <option key={name} value={name}>
              {name === 'all' ? 'All Classes' : name}
            </option>
          ))}
        </select>
      </div>

      {filtered.map((item) => (
        <CurriculumRow
          key={item.id}
          item={item}
          imgSrc={arrangeImage(item.service?.name ?? '')}
          checkDisabled={checkDisabled}
        />
      ))}
    </div>
  )
}

/**
 * One curriculum group: a horizontally-scrolling row of lesson cards with prev/next
 * arrows (Nuxt `v-slide-group show-arrows`). On mobile the row is capped to ~320px so
 * roughly one card shows and is paged via the arrows, matching Nuxt's mobile carousel.
 */
function CurriculumRow({
  item,
  imgSrc,
  checkDisabled,
}: {
  item: Curriculum
  imgSrc: string
  checkDisabled: (curriculum: Curriculum, lesson: any) => boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollByCard = (dir: number) =>
    scrollRef.current?.scrollBy({ left: dir * 270, behavior: 'smooth' })

  return (
    <div className="mb-8">
      <h3 className="pl-5 md:pl-16 text-xl font-bold mb-4">{item.name}</h3>
      <div className="relative mx-auto max-w-[320px] px-8 md:max-w-none md:px-12">
        <button
          onClick={() => scrollByCard(-1)}
          aria-label="Previous classes"
          className="absolute left-1 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-700 shadow md:h-9 md:w-9"
        >
          <ChevronLeft size={18} />
        </button>
        <div ref={scrollRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-4">
          {item.lessons.map((lesson: any) => {
            const disabled = checkDisabled(item, lesson)
            return (
              <div
                key={lesson.id}
                className="min-w-[250px] max-w-[250px] flex-shrink-0 overflow-hidden rounded bg-white shadow mb-[60px]"
              >
                {imgSrc && (
                  <div className="relative w-full h-[200px]">
                    <Image
                      src={imgSrc}
                      alt="Curriculum image"
                      fill
                      className="object-cover"
                      sizes="250px"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-3">
                  <h4 className="font-semibold text-black">{lesson.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">{item.service?.name}</p>
                  <p className="text-sm mt-1">Advanced</p>
                </div>
                <div className="px-3 pb-3">
                  {disabled ? (
                    <button
                      disabled
                      className="w-full max-w-[200px] mx-auto block py-2 text-white text-sm rounded opacity-50 cursor-not-allowed"
                      style={{ backgroundColor: '#d90000' }}
                    >
                      Members Only
                    </button>
                  ) : (
                    <Link
                      href={`/curriculum/lesson/${lesson.id}`}
                      className="block w-full max-w-[200px] mx-auto text-center py-2 text-white text-sm rounded"
                      style={{ backgroundColor: '#d90000' }}
                    >
                      View Class
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        <button
          onClick={() => scrollByCard(1)}
          aria-label="Next classes"
          className="absolute right-1 top-1/2 z-10 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-700 shadow md:h-9 md:w-9"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
