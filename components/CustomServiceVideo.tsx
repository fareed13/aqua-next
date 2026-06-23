'use client'

import { useState, useEffect, useId } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { ImageSelector } from './ImageSelector'
import { useOrgStore } from '@/store/orgStore'
import { useAdminMediaCrud } from '@/hooks/admin/useAdminMedia'

interface ServiceVideoMedia {
  name: string
  type: string
  extension: string
}

interface ServiceVideoEntry {
  service: string | number
  media: ServiceVideoMedia
}

interface MediaItem {
  id?: number
  uuid: string
  name: string
  extension: string
  media_type?: string
}

interface Props {
  initialVideo?: ServiceVideoEntry[]
  medias?: MediaItem[]
  onChange: (items: ServiceVideoEntry[]) => void
}

const emptyEntry = (): ServiceVideoEntry => ({ media: { name: '', type: '', extension: '' }, service: '' })

export function CustomServiceVideo({ initialVideo = [], medias: mediaProp = [], onChange }: Props) {
  const formId = useId()
  const organization = useOrgStore((s) => s.organization)
  const services = organization?.services ?? []
  const isUk = (organization as any)?.is_uk ?? false

  const { fetchMediaByOrganization } = useAdminMediaCrud()
  const [items, setItems] = useState<ServiceVideoEntry[]>([emptyEntry()])
  const [mediasData, setMediasData] = useState<MediaItem[]>(mediaProp)

  useEffect(() => {
    setItems(initialVideo.length ? initialVideo : [emptyEntry()])
  }, [])

  useEffect(() => { setMediasData(mediaProp) }, [mediaProp])

  const update = (next: ServiceVideoEntry[]) => {
    setItems(next)
    onChange(next)
  }

  const add = () => {
    if (items.length < 4) update([...items, emptyEntry()])
  }

  const remove = (entry: ServiceVideoEntry) => {
    const next = items.filter((e) => e !== entry)
    update(next.length ? next : [emptyEntry()])
  }

  const changeService = (i: number, val: string | number) => {
    const next = items.map((e, idx) => idx === i ? { ...e, service: val } : e)
    update(next)
  }

  const onMediaSelected = (uuid: string, idx: number) => {
    const mediaObj = mediasData.find((m) => m.uuid === uuid)
    if (!mediaObj) return
    const next = items.map((e, i) =>
      i === idx ? { ...e, media: { name: mediaObj.uuid, type: mediaObj.media_type ?? '', extension: mediaObj.extension } } : e
    )
    update(next)
  }

  const getPreviewUrl = (entry: ServiceVideoEntry) => {
    if (!entry.media?.name) return ''
    const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
    return `${MEDIA_URL}/${entry.media.name}_350.${entry.media.extension}`
  }

  const fetchMedia = async () => {
    try {
      const res = await fetchMediaByOrganization()
      setMediasData(res as MediaItem[])
    } catch {}
  }

  const filteredServices = services
    .filter((s: any) => !s.parent_service)
    .map((s: any) => ({ id: s.id, name: s.name }))

  return (
    <div className="mt-6 space-y-4">
      <div className="flex justify-end">
        {items.length < 4 && (
          <button type="button" onClick={add} className="text-[#124e66] text-sm hover:underline">
            Add more {isUk ? 'programme' : 'program'} +
          </button>
        )}
      </div>

      {items.map((entry, i) => (
        <div key={`${formId}-${i}`} className="flex flex-wrap items-center gap-3">
          <div className="w-36">
            <select
              className="w-full border rounded px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
              value={entry.service}
              onChange={(e) => changeService(i, e.target.value)}
            >
              <option value="">Service</option>
              {filteredServices.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-shrink-0">
            <ImageSelector
              medias={mediasData}
              onImageSelected={(uuid) => onMediaSelected(uuid, i)}
              preSelected={entry.media?.name}
              isUploader
              refreshMedia={fetchMedia}
            />
          </div>

          {getPreviewUrl(entry) && (
            <div className="w-24 h-24 flex-shrink-0">
              {entry.media?.extension === 'mp4' ? (
                <video src={getPreviewUrl(entry)} className="w-full h-full object-cover rounded border" />
              ) : (
                <Image
                  src={getPreviewUrl(entry)}
                  alt="Service image"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded border"
                />
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => remove(entry)}
            aria-label={`Delete ${(entry as any).service || 'program'}`}
            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
