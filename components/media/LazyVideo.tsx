'use client'

import { useEffect, useRef, useState } from 'react'

type LazyVideoProps = Omit<React.VideoHTMLAttributes<HTMLVideoElement>, 'src' | 'autoPlay'> & {
  src: string
  /** Mirrors Nuxt's `media.autoPlay` flag (VideoPlayer.vue) — defaults to true as Nuxt does. */
  autoPlay?: boolean
  /** How early to start loading relative to the viewport. */
  rootMargin?: string
  /** Forwarded to the underlying <video> alongside the internal observer ref. */
  ref?: React.Ref<HTMLVideoElement>
}

/**
 * Video that keeps its URL out of the server-rendered HTML.
 *
 * Nuxt builds its player with video.js inside onMounted, so the markup the
 * browser first parses contains no video URL and nothing downloads until after
 * hydration. Rendering `src` directly into the HTML (as the plain <video> ports
 * did) lets the parser start fetching during parse — on the home page that put
 * ~8.5 MB of video on the wire at ~130ms, starving the LCP hero image.
 *
 * Attaching `src` only once the element nears the viewport reproduces Nuxt's
 * timing and keeps offscreen videos off the critical path entirely.
 */
export function LazyVideo({ src, autoPlay = true, rootMargin = '200px', ref: forwardedRef, ...rest }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [active, setActive] = useState(false)

  // Keep our observer ref working while still handing the element to callers
  // (VideoPlayer needs it to toggle `muted` from its own observer).
  const setRefs = (node: HTMLVideoElement | null) => {
    ref.current = node
    if (typeof forwardedRef === 'function') forwardedRef(node)
    else if (forwardedRef) (forwardedRef as React.RefObject<HTMLVideoElement | null>).current = node
  }

  useEffect(() => {
    const el = ref.current
    if (!el || active) return

    // No IntersectionObserver (old browsers, jsdom): fall back to loading on mount,
    // which still keeps the URL out of the SSR payload.
    if (typeof IntersectionObserver === 'undefined') {
      setActive(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [rootMargin, active])

  return (
    <video
      {...rest}
      ref={setRefs}
      src={active ? src : undefined}
      autoPlay={active && autoPlay}
      preload="none"
    />
  )
}
