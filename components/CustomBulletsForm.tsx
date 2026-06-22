'use client'

import { useState, useEffect, useId } from 'react'
import { X } from 'lucide-react'
import Image from 'next/image'
import { ImageSelector } from './ImageSelector'
import { buildMediaUrl } from '@/lib/utils/media'

interface BulletMedia {
  name: string
  type: string
  extension: string
}

interface CustomBullet {
  headline: string
  content: string
  media: BulletMedia | string
}

interface MediaItem {
  id?: number
  uuid: string
  name: string
  extension: string
  media_type?: string
}

interface Props {
  initialBullets?: CustomBullet[]
  medias?: MediaItem[]
  onChange: (bullets: CustomBullet[]) => void
}

const emptyBullet = (): CustomBullet => ({ headline: '', content: '', media: '' })

export function CustomBulletsForm({ initialBullets = [], medias = [], onChange }: Props) {
  const formId = useId()
  const [bullets, setBullets] = useState<CustomBullet[]>([emptyBullet()])

  useEffect(() => {
    setBullets(initialBullets.length ? initialBullets : [emptyBullet()])
  }, [])

  const update = (next: CustomBullet[]) => {
    setBullets(next)
    onChange(next)
  }

  const add = () => update([...bullets, emptyBullet()])

  const remove = (bullet: CustomBullet) => {
    const next = bullets.filter((b) => b !== bullet)
    update(next)
  }

  const change = (i: number, field: keyof CustomBullet, val: string) => {
    const next = bullets.map((b, idx) => idx === i ? { ...b, [field]: val } : b)
    update(next)
  }

  const onMediaSelected = (uuid: string, bulletIdx: number) => {
    const mediaObj = medias.find((m) => m.uuid === uuid)
    if (!mediaObj) return
    const next = bullets.map((b, i) =>
      i === bulletIdx
        ? { ...b, media: { name: mediaObj.uuid, type: mediaObj.media_type ?? '', extension: mediaObj.extension } }
        : b
    )
    update(next)
  }

  const getPreviewUrl = (bullet: CustomBullet) => {
    if (!bullet.media || typeof bullet.media === 'string') return ''
    const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
    return `${MEDIA_URL}/${bullet.media.name}_350.${bullet.media.extension}`
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={add} className="text-[#124e66] text-sm hover:underline">
          Add bullet +
        </button>
      </div>

      {bullets.map((bullet, i) => (
        <div key={`${formId}-${i}`} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
          <div className="space-y-3 mb-4">
            <input
              className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="Headline"
              value={bullet.headline}
              onChange={(e) => change(i, 'headline', e.target.value)}
            />
            <input
              className="w-full border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
              placeholder="Content"
              value={bullet.content}
              onChange={(e) => change(i, 'content', e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start">
            <div className="flex-shrink-0">
              <ImageSelector
                medias={medias}
                onImageSelected={(uuid) => onMediaSelected(uuid, i)}
                preSelected={typeof bullet.media === 'object' ? bullet.media.name : ''}
                buttonText="Select Image"
              />
            </div>
            {getPreviewUrl(bullet) && (
              <div className="flex-1">
                {typeof bullet.media === 'object' && bullet.media.extension === 'mp4' ? (
                  <video src={getPreviewUrl(bullet)} className="h-24 object-cover rounded border" />
                ) : (
                  <Image
                    src={getPreviewUrl(bullet)}
                    alt={bullet.headline || 'Bullet image'}
                    width={200}
                    height={100}
                    className="h-24 w-full object-contain rounded border bg-white"
                  />
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-3">
            <button type="button" onClick={() => remove(bullet)} title="Remove bullet" className="text-gray-400 hover:text-red-500 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
