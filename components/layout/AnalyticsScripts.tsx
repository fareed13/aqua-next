'use client'

import { useEffect } from 'react'
import { useOrgStore } from '@/store/orgStore'
import { useAuthStore } from '@/store/authStore'

export function AnalyticsScripts() {
  const organization = useOrgStore(s => s.organization)
  const location     = useOrgStore(s => s.location)
  const domain       = useOrgStore(s => s.domain)
  const userToken    = useAuthStore(s => s.userToken)

  // abbiEvents-nuxt3.js reads window.__NUXT__.pinia.abbi.* directly (Nuxt SSR shape).
  // We replicate that structure from Zustand so the script works without Pinia.
  useEffect(() => {
    window.__NUXT__ = {
      pinia: {
        abbi: {
          organization: organization ?? {},
          location:     location     ?? {},
          domain:       domain ?? '',
        },
      },
    }
  }, [organization, location, domain])

  // GTM
  useEffect(() => {
    const gtmId = organization?.gtm_container_id
    if (!gtmId) return

    window.dataLayer = window.dataLayer || []

    const load = () => {
      if (document.querySelector(`script[src*="${gtmId}"]`)) return

      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`
      document.head.appendChild(script)

      const noscript = document.createElement('noscript')
      const iframe = document.createElement('iframe')
      iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`
      iframe.height = '0'
      iframe.width = '0'
      iframe.style.display = 'none'
      iframe.style.visibility = 'hidden'
      noscript.appendChild(iframe)
      document.body.appendChild(noscript)
    }

    // Defer 4s + idle — matches Nuxt GTM plugin
    const schedule = () => setTimeout(() => {
      'requestIdleCallback' in window
        ? requestIdleCallback(load, { timeout: 8000 })
        : setTimeout(load, 2000)
    }, 4000)

    document.readyState === 'complete' ? schedule() : window.addEventListener('load', schedule, { once: true })
  }, [organization?.gtm_container_id])

  // Google Analytics (gtag)
  useEffect(() => {
    const gtagIds = (organization?.gtag ?? []).filter(Boolean)
    if (!gtagIds.length) return

    const gtag = (...args: unknown[]) => {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push(args)
    }

    const load = async () => {
      window.dataLayer = window.dataLayer || []
      if (!window.gtag) {
        window.gtag = (...args: unknown[]) => { window.dataLayer.push(args) }
      }
      window.gtag('js', new Date())

      if (!document.querySelector(`script[src*="gtag/js"]`)) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script')
          s.async = true
          s.src = `https://www.googletagmanager.com/gtag/js?id=${gtagIds[0]}`
          s.onload = () => resolve()
          s.onerror = () => reject()
          document.head.appendChild(s)
        })
      }

      gtagIds.forEach(id => {
        gtag('config', id, { send_page_view: true, cookie_flags: 'SameSite=None;Secure' })
      })
    }

    const schedule = () => setTimeout(() => {
      'requestIdleCallback' in window
        ? requestIdleCallback(load, { timeout: 8000 })
        : setTimeout(load, 2000)
    }, 4000)

    document.readyState === 'complete' ? schedule() : window.addEventListener('load', schedule, { once: true })
  }, [organization?.gtag])

  // ABBI Events capture script (only when is_analytics_enabled)
  useEffect(() => {
    if (!organization?.is_analytics_enabled) return

    const load = () => {
      if (document.querySelector('script[src*="abbiEvents"]')) return
      const s = document.createElement('script')
      s.src = 'https://d3s21nfz1lzlqc.cloudfront.net/abbiEvents-nuxt3.js'
      s.async = true
      s.defer = true
      document.head.appendChild(s)
    }

    const schedule = () => setTimeout(() => {
      'requestIdleCallback' in window
        ? requestIdleCallback(load, { timeout: 8000 })
        : setTimeout(load, 2000)
    }, 4000)

    document.readyState === 'complete' ? schedule() : window.addEventListener('load', schedule, { once: true })
  }, [organization?.is_analytics_enabled])

  // Facebook Pixel
  useEffect(() => {
    const pixelIds = (organization?.pixel ?? []).filter(
      (id): id is string => typeof id === 'string' && /^\d+$/.test(id.trim())
    )
    if (!pixelIds.length) return

    const load = () => {
      if (window.fbq) {
        pixelIds.forEach(id => window.fbq!('init', id))
        return
      }

      const fbq: any = (...args: unknown[]) => {
        fbq.callMethod ? fbq.callMethod(...args) : fbq.queue.push(args)
      }
      fbq.push = fbq
      fbq.loaded = false
      fbq.version = '2.0'
      fbq.queue = []
      window.fbq = window._fbq = fbq

      pixelIds.forEach(id => window.fbq!('init', id))
      window.fbq('track', 'PageView')

      const s = document.createElement('script')
      s.src = 'https://connect.facebook.net/en_US/fbevents.js'
      s.async = true
      document.head.appendChild(s)
    }

    const defer = (fn: () => void) => {
      const run = () => 'requestIdleCallback' in window
        ? requestIdleCallback(fn, { timeout: 3000 })
        : setTimeout(fn, 2000)
      document.readyState === 'complete' ? run() : window.addEventListener('load', run, { once: true })
    }

    defer(load)
  }, [organization?.pixel])

  // org.scripts[] — custom third-party pixels/widgets from admin panel (Nuxt: 05.custom-pixel.client.js)
  useEffect(() => {
    const scripts = (organization?.scripts ?? []).filter(sc => {
      const src = sc.script_src?.trim() ?? ''
      return (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) &&
        /\.(js|mjs|cjs)(\?|$)/.test(src)
    })
    if (!scripts.length) return

    const whenIdle = (fn: () => void) => {
      'requestIdleCallback' in window
        ? requestIdleCallback(fn, { timeout: 5000 })
        : setTimeout(fn, 300)
    }

    const loadScript = (sc: typeof scripts[0]) => new Promise<void>((resolve) => {
      if (sc.script_id && document.getElementById(sc.script_id)) { resolve(); return }
      if (sc.extra_params?.window) {
        Object.entries(sc.extra_params.window as Record<string, unknown>).forEach(([k, v]) => {
          if (!isNaN(Number(k))) return
          try { (window as any)[k] = v } catch {}
        })
      }
      const el = document.createElement('script')
      el.src = sc.script_src
      el.async = true
      if (sc.script_id) el.id = sc.script_id
      el.onload = () => resolve()
      el.onerror = () => resolve()
      document.body.appendChild(el)
    })

    const loadChain = (index: number) => {
      if (index >= scripts.length) return
      loadScript(scripts[index]).finally(() => whenIdle(() => loadChain(index + 1)))
    }

    const start = () => whenIdle(() => loadChain(0))
    document.readyState === 'complete' ? start() : window.addEventListener('load', start, { once: true })
  }, [organization?.scripts])

  return null
}

// Augment window for TS
declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
    fbq: ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string; push: unknown }
    _fbq: Window['fbq']
    __NUXT__?: {
      pinia: {
        abbi: {
          organization: object
          location: object
          domain: string
        }
      }
    }
  }
}
