'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

/**
 * Stand-ins for the Vuetify inputs the Nuxt admin forms are built from.
 * Nuxt gets `v-autocomplete` / `v-combobox` for free; this app has no component
 * library, so the behaviours they rely on (type-to-filter, free text entry,
 * chips) are reproduced here once instead of per-form.
 *
 * Only ever import these from admin components that are themselves lazy-loaded
 * — nothing here should reach a public bundle.
 */

export const FIELD_CLASS = 'w-full border border-gray-300 rounded px-3 py-2 text-sm'
export const LABEL_CLASS = 'block text-sm font-medium text-gray-700 mb-1'

/** Close on any mousedown outside `ref`. Shared by both inputs below. */
function useOutsideClose(
  ref: React.RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return
    const onDocMouseDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [ref, open, onClose])
}

function filterItems(items: string[], query: string): string[] {
  const q = query.trim().toLowerCase()
  return q ? items.filter(i => i.toLowerCase().includes(q)) : items
}

interface AutocompleteProps {
  label: string
  items: string[]
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
}

/**
 * Single-select, type-to-filter — Vuetify `v-autocomplete`.
 * Unlike MultiCombobox this does NOT accept free text: the value must come
 * from `items`, matching v-autocomplete.
 */
export function Autocomplete({ label, items, value, onChange, required, placeholder }: AutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  // Typing filters; closing throws the query away so the input falls back to
  // showing the committed value rather than a half-typed search.
  useOutsideClose(ref, open, () => { setOpen(false); setQuery('') })

  const filtered = useMemo(() => filterItems(items, query), [items, query])

  return (
    <div className="relative" ref={ref}>
      <label className={LABEL_CLASS}>{label}{required && ' *'}</label>
      <div className="relative">
        <input
          className={`${FIELD_CLASS} pr-8`}
          value={open ? query : value}
          placeholder={placeholder}
          onFocus={() => { setOpen(true); setQuery('') }}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
        />
        <ChevronDown
          size={16}
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">No results</div>
          ) : (
            filtered.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => { onChange(item); setOpen(false); setQuery('') }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${item === value ? 'bg-gray-100 font-medium' : ''}`}
              >
                {item}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface MultiComboboxProps {
  label: string
  items: string[]
  value: string[]
  onChange: (next: string[]) => void
  /** Rendered under the field, always visible (Vuetify `persistent-hint`). */
  hint?: string
  /** Vuetify `chips` — selections as removable pills instead of comma text. */
  chips?: boolean
  placeholder?: string
}

/**
 * Multi-select with type-to-filter and free text entry — Vuetify `v-combobox
 * multiple`. Enter commits whatever is typed, so values outside `items` are
 * allowed; that is what makes it a combobox rather than a select.
 */
export function MultiCombobox({ label, items, value, onChange, hint, chips = false, placeholder }: MultiComboboxProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useOutsideClose(ref, open, () => setOpen(false))

  const filtered = useMemo(() => filterItems(items, query), [items, query])

  const toggle = (name: string) =>
    onChange(value.includes(name) ? value.filter(v => v !== name) : [...value, name])

  const commitTyped = () => {
    const typed = query.trim()
    if (!typed) return
    if (!value.includes(typed)) onChange([...value, typed])
    setQuery('')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commitTyped()
      return
    }
    // Backspace on an empty query removes the last selection, as v-combobox does.
    if (e.key === 'Backspace' && !query && value.length) onChange(value.slice(0, -1))
  }

  return (
    <div className="relative" ref={ref}>
      <label className={LABEL_CLASS}>{label}</label>
      <div
        onClick={() => setOpen(true)}
        className="relative w-full min-h-[42px] border border-gray-300 rounded px-3 pr-8 py-1.5 text-sm bg-white cursor-text flex flex-wrap items-center gap-1"
      >
        {chips
          ? value.map(v => (
              <span key={v} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                {v}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); toggle(v) }}
                  className="text-gray-500 hover:text-gray-800"
                  aria-label={`Remove ${v}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))
          : value.length > 0 && <span className="py-1">{value.join(', ')}</span>}
        <input
          className="flex-1 min-w-[60px] outline-none py-1 bg-transparent"
          value={query}
          placeholder={value.length === 0 ? placeholder : ''}
          onFocus={() => setOpen(true)}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onKeyDown={onKeyDown}
        />
        <ChevronDown
          size={16}
          className={`absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
      {open && (
        <div className="absolute z-30 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg py-1">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">
              {query.trim() ? `Press Enter to add "${query.trim()}"` : 'No results'}
            </div>
          ) : (
            filtered.map(item => (
              <label key={item} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.includes(item)}
                  onChange={() => toggle(item)}
                  className="accent-[#124e66]"
                />
                <span className="truncate">{item}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )
}
