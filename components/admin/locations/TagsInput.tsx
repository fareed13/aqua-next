'use client'

import { useId, useState } from 'react'
import { X } from 'lucide-react'

/**
 * Free-entry chips input — the Next equivalent of Nuxt's `v-combobox multiple chips`.
 * Type + Enter/comma adds a chip; Backspace on empty removes the last; optional
 * `suggestions` power a datalist (used for Target Locations city suggestions).
 */
export function TagsInput({
  values,
  onChange,
  placeholder = '',
  suggestions,
}: {
  values: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  suggestions?: string[]
}) {
  const [draft, setDraft] = useState('')
  const listId = useId()

  const add = (raw: string) => {
    const v = raw.trim()
    if (!v) return
    if (!values.includes(v)) onChange([...values, v])
    setDraft('')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      add(draft)
    } else if (e.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1))
    }
  }

  return (
    <div className="flex min-h-[46px] w-full flex-wrap items-center gap-1.5 rounded-md border border-gray-300 bg-[#f5f5f8] px-2 py-1.5 focus-within:border-[#124e66] focus-within:ring-1 focus-within:ring-[#124e66]">
      {values.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-full bg-[#e6edfd] px-2.5 py-0.5 text-[13px] text-[#2a4d9b]">
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`}>
            <X size={13} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => add(draft)}
        placeholder={values.length ? '' : placeholder}
        list={suggestions ? listId : undefined}
        className="min-w-[120px] flex-1 bg-transparent px-1 py-1 text-base outline-none"
      />
      {suggestions && (
        <datalist id={listId}>
          {suggestions.map((s) => <option key={s} value={s} />)}
        </datalist>
      )}
    </div>
  )
}
