'use client'

import { useState, useEffect } from 'react'

interface Props {
  dialog: boolean
  textArray: string[]
  interval: number
}

export function TextTransitionLoader({ dialog, textArray, interval }: Props) {
  const [targetedIndex, setTargetedIndex] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!dialog) return
    setTargetedIndex(0)
    const timers: ReturnType<typeof setTimeout>[] = []
    textArray.forEach((_, idx) => {
      const delay = (interval ? interval * 1000 : 3000) * idx
      timers.push(
        setTimeout(() => {
          setVisible(false)
          setTimeout(() => {
            setTargetedIndex(idx)
            setVisible(true)
          }, 200)
        }, delay)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [dialog, textArray, interval])

  if (!dialog) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white/90 rounded-lg shadow-lg px-6 py-4 max-w-lg w-full mx-4">
        <div className="flex items-center gap-4">
          <div className="border-r-4 border-[#175383] pr-4 flex-shrink-0">
            <div className="w-8 h-8 border-4 border-[#175383] border-t-transparent rounded-full animate-spin" />
          </div>
          <div className="flex-1 min-h-[28px]">
            <p
              className="text-base transition-opacity duration-200"
              style={{ opacity: visible ? 1 : 0 }}
            >
              {textArray[targetedIndex]}…
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
