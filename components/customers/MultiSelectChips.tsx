'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface Option { id: number; name: string }

/**
 * Compact single-line multi-select that shows picks as removable chips and opens a
 * checkbox dropdown — mirrors Nuxt's Vuetify `chips multiple` v-select. Replaces the
 * native `<select multiple>` (which expands to several rows and made the bulk-update
 * bar too tall).
 */
export function MultiSelectChips({
  options,
  value,
  onChange,
  disabled,
  placeholder = 'Select the options',
}: {
  options: Option[]
  value: number[]
  onChange: (next: number[]) => void
  disabled?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter(v => v !== id) : [...value, id])

  const selected = options.filter(o => value.includes(o.id))

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => !disabled && setOpen(o => !o)}
        className={`flex min-h-[50px] w-full cursor-pointer items-center gap-2 rounded border border-gray-300 bg-white px-3 py-2 text-[15px] ${
          disabled ? 'cursor-not-allowed bg-gray-100' : ''
        }`}
      >
        <div className="flex flex-1 flex-wrap gap-1.5">
          {selected.length === 0 && <span className="text-gray-400">{placeholder}</span>}
          {selected.map(o => (
            <span key={o.id} className="inline-flex items-center gap-1 rounded-full bg-[#e6edfd] px-2.5 py-0.5 text-[13px] text-[#2a4d9b]">
              {o.name}
              <button
                type="button"
                onClick={e => { e.stopPropagation(); toggle(o.id) }}
                aria-label={`Remove ${o.name}`}
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
        <ChevronDown size={18} className={`shrink-0 text-gray-500 transition ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && !disabled && (
        <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded border border-gray-200 bg-white shadow-lg">
          {options.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">No options</p>}
          {options.map(o => (
            <label key={o.id} className="flex cursor-pointer items-center gap-2 px-3 py-2 text-[15px] hover:bg-[#eef2fb]">
              <input type="checkbox" checked={value.includes(o.id)} onChange={() => toggle(o.id)} />
              {o.name}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
