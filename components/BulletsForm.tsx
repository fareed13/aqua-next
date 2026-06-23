'use client'

import { useState, useEffect, useId } from 'react'
import { X } from 'lucide-react'

interface Props {
  initialBullets?: string[]
  onChange: (bullets: string[]) => void
}

export function BulletsForm({ initialBullets = [], onChange }: Props) {
  const formId = useId()
  const [bullets, setBullets] = useState<string[]>([])

  useEffect(() => {
    const raw = initialBullets
    const formatted =
      raw.length > 0 && typeof raw[0] === 'object'
        ? (raw[0] as unknown as string[])
        : raw
    const initial = formatted.length ? formatted : ['']
    setBullets(initial)
  }, [])

  const update = (next: string[]) => {
    setBullets(next)
    onChange(next)
  }

  const add = () => update([...bullets, ''])

  const remove = (i: number) => {
    const next = bullets.filter((_, idx) => idx !== i)
    update(next)
  }

  const change = (i: number, val: string) => {
    const next = [...bullets]
    next[i] = val
    update(next)
  }

  return (
    <div className="mt-[-12px]">
      <div className="flex justify-end mb-1">
        <button
          type="button"
          onClick={add}
          className="text-[#124e66] text-sm hover:underline"
        >
          Add bullet +
        </button>
      </div>
      {bullets.map((bullet, i) => (
        <div key={`${formId}-${i}`} className="flex items-center gap-2 mb-2">
          <input
            className="flex-1 border rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
            placeholder="Bullet"
            value={bullet}
            onChange={(e) => change(i, e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            title="Remove bullet"
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
