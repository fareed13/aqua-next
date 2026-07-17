'use client'

import { useState, useEffect, useId } from 'react'
import { X, Plus } from 'lucide-react'

interface Props {
  initialBullets?: string[]
  onChange: (bullets: string[]) => void
}

export function BulletsForm({ initialBullets = [], onChange }: Props) {
  const formId = useId()
  const [bullets, setBullets] = useState<string[]>([])

  useEffect(() => {
    const raw = initialBullets
    // Callers pass [field.value], so a saved list arrives double-wrapped as [[...]] and
    // needs one level unwrapped. A newly added field is {key: null, value: null} though,
    // which makes raw [null] — and since typeof null === 'object', the unwrap yields null.
    // Nuxt tolerates that via `!initialBulletsFormatted ? []`; that guard was lost in the
    // port, so this read null.length and threw. Array.isArray restores it: anything that
    // isn't a list (null, a bare object) falls back to one empty bullet, as in Nuxt.
    const unwrapped = typeof raw[0] === 'object' ? raw[0] : raw
    const list = Array.isArray(unwrapped) ? (unwrapped as unknown[]) : []
    // Keep every slot but never hand null/undefined to a controlled <input>.
    setBullets(list.length ? list.map(b => (typeof b === 'string' ? b : '')) : [''])
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
          className="inline-flex items-center gap-1.5 rounded-md border border-[#124e66] px-3 py-1.5 text-sm font-medium text-[#124e66] hover:bg-[#124e66] hover:text-white transition-colors"
        >
          <Plus size={16} />
          Add bullet
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
