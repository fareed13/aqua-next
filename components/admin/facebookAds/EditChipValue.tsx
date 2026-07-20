'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

/**
 * Small chip-edit helper (ported from Nuxt EditChipValue.vue). Opens a dialog with a
 * textarea seeded from the chip's current value; "Update" hands the new value back to
 * the parent so it can replace the chip in its list.
 */
export function EditChipValue({
  open,
  value,
  onUpdate,
  onClose,
}: {
  open: boolean
  value: string
  onUpdate: (newValue: string) => void
  onClose: () => void
}) {
  const [inputText, setInputText] = useState('')

  // Re-seed the textarea whenever a new chip is opened for editing.
  useEffect(() => {
    if (open) setInputText(value)
  }, [open, value])

  if (!open) return null

  const updateChip = () => {
    if (value !== inputText) onUpdate(inputText)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[650px] rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="text-lg font-semibold">Edit value</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full border border-red-500 p-1 text-red-500 hover:bg-red-50"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            className="w-full resize-y rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#124e66] focus:ring-1 focus:ring-[#124e66]"
          />
        </div>
        <div className="flex justify-start border-t px-5 py-4">
          <button
            onClick={updateChip}
            className="rounded bg-[#1565C0] px-6 py-2 font-medium text-white hover:bg-[#0e4a94]"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  )
}
