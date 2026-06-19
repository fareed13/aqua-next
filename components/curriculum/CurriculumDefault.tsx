'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useOrgStore } from '@/store/orgStore'
import { buildMediaUrl } from '@/lib/utils/media'
import type { Curriculum, Service } from '@/types/api'

interface Props {
  curriculumList: Curriculum[]
}

export function CurriculumDefault({ curriculumList }: Props) {
  const organization = useOrgStore((s) => s.organization)
  const services = organization?.services ?? []
  const requiresLogin = organization?.require_login_for_virtual_classes ?? false

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

  function checkDisabled(curriculum: Curriculum, lesson: any): boolean {
    if (!requiresLogin) return false
    if (curriculum.is_public) return !lesson.is_public
    return true
  }

  return (
    <div className="py-8 pb-8">
      <div className="max-w-[500px] mx-auto px-4 mb-6">
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
        <div key={item.id} className="mb-8">
          <h3 className="pl-4 md:pl-16 text-xl font-bold mb-4">{item.name}</h3>
          <div className="flex gap-5 overflow-x-auto px-4 pb-4">
            {item.lessons.map((lesson: any) => {
              const imgSrc = arrangeImage(item.service?.name ?? '')
              const disabled = checkDisabled(item, lesson)

              return (
                <div
                  key={lesson.id}
                  className="min-w-[250px] max-w-[250px] bg-white shadow rounded overflow-hidden flex-shrink-0 mb-[60px]"
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
        </div>
      ))}
    </div>
  )
}
