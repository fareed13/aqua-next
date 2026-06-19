'use client'

import { useState, useCallback, useRef } from 'react'

const SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY_RECAPTCHA ?? ''

let sharedLoadingPromise: Promise<void> | null = null

export function useRecaptcha() {
  const [recaptchaReady, setRecaptchaReady] = useState(false)
  const readyRef = useRef(false)

  const loadRecaptchaScript = useCallback((): Promise<void> => {
    if (sharedLoadingPromise) return sharedLoadingPromise
    if (readyRef.current) return Promise.resolve()
    if (typeof window === 'undefined') return Promise.resolve()

    sharedLoadingPromise = new Promise((resolve) => {
      const existingScript = document.querySelector('script[src*="recaptcha/api.js"]')
      if (existingScript) {
        readyRef.current = true
        setRecaptchaReady(true)
        sharedLoadingPromise = null
        resolve()
        return
      }

      const setReady = () => {
        readyRef.current = true
        setRecaptchaReady(true)
        sharedLoadingPromise = null
        resolve()
      }

      const callbackName = '__recaptchaOnLoad_' + Date.now()
      ;(window as any)[callbackName] = () => {
        delete (window as any)[callbackName]
        setTimeout(setReady, 150)
      }

      const script = document.createElement('script')
      script.src = `https://www.google.com/recaptcha/api.js?render=explicit&onload=${callbackName}`
      script.async = true
      script.defer = true

      script.onload = () => {
        const g = (window as any).grecaptcha
        if (g && typeof g.ready === 'function') {
          g.ready(setReady)
          return
        }
        setTimeout(setReady, 500)
      }

      script.onerror = () => {
        delete (window as any)[callbackName]
        console.error('[useRecaptcha] Failed to load reCAPTCHA script')
        sharedLoadingPromise = null
        if (script.parentNode) script.remove()
        resolve()
      }

      document.head.appendChild(script)
    })

    return sharedLoadingPromise
  }, [])

  const getSiteKey = useCallback(() => SITE_KEY, [])

  return { recaptchaReady, loadRecaptchaScript, getSiteKey }
}
