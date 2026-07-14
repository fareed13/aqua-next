'use client'

import { useEffect } from 'react'

// Locks background scroll while a sidebar/drawer/modal is open.
// Uses `position: fixed` on <body> (offset by the current scroll position) instead of
// `overflow: hidden`. An `overflow` value on an ancestor makes that ancestor the sticky
// positioning context, which breaks any `position: sticky` header inside it (it stops
// tracking the viewport and sits at its scrolled-away static position — appearing to
// vanish). `position: fixed` doesn't create that scroll container, so sticky headers
// keep working while the page underneath is locked.
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return

    const scrollY = window.scrollY
    const { body } = document
    body.style.position = 'fixed'
    body.style.top = `-${scrollY}px`
    body.style.left = '0'
    body.style.right = '0'

    return () => {
      body.style.position = ''
      body.style.top = ''
      body.style.left = ''
      body.style.right = ''
      window.scrollTo(0, scrollY)
    }
  }, [locked])
}
