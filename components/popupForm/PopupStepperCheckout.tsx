'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useUiStore } from '@/store/uiStore'
import { Checkout } from './stepperCheckout/Checkout'

export function PopupStepperCheckout() {
  const dialog = useUiStore((s) => s.dialog)
  const setDialog = useUiStore((s) => s.setDialog)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('dialog') === 'true') {
      setDialog(true)
    }
  }, [])

  return (
    <>
      {/* Backdrop overlay */}
      {dialog && (
        <div
          className="fixed inset-0 bg-black/30 z-[998]"
          onClick={() => setDialog(false)}
        />
      )}

      {/* Right-side drawer */}
      <div
        className={[
          'fixed inset-y-0 right-0 z-[999] w-full md:w-[30%] bg-white shadow-xl overflow-y-auto transition-transform duration-300',
          dialog ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <Checkout />
      </div>
    </>
  )
}
