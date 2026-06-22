'use client'

import { useEffect, useRef, useState } from 'react'
import { useOrgStore } from '@/store/orgStore'

interface EmbedScript {
  script_id?: string
  script_src: string
}

const isJsUrl = (url: string) => {
  const clean = url.split('?')[0].split('#')[0]
  return clean.endsWith('.js') || clean.endsWith('.mjs') || clean.endsWith('.cjs') || url.includes('.js?')
}

export function CustomEmbeds() {
  const organization = useOrgStore((s) => s.organization)
  const [pageLoaded, setPageLoaded] = useState(false)
  const iframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({})

  const embedScripts: EmbedScript[] = ((organization as any)?.scripts ?? []).filter((sc: EmbedScript) => {
    if (!sc.script_src || typeof sc.script_src !== 'string') return false
    const src = sc.script_src.trim()
    const isValidUrl = src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')
    return isValidUrl && !isJsUrl(src)
  })

  useEffect(() => {
    if (document.readyState === 'complete') {
      setPageLoaded(true)
    } else {
      window.addEventListener('load', () => setPageLoaded(true), { once: true })
    }

    const handleMessage = (event: MessageEvent) => {
      const data = event.data
      if (!data) return

      const resize = (source: MessageEventSource | null, height: number) => {
        if (!height || height < 10) return
        Object.values(iframeRefs.current).forEach((iframe) => {
          if (iframe && iframe.contentWindow === source) {
            iframe.style.height = `${height}px`
          }
        })
      }

      if (typeof data === 'string' && data.startsWith('form-height:')) {
        resize(event.source, parseInt(data.replace('form-height:', ''), 10))
        return
      }
      if (typeof data !== 'object') return
      if (data.type === 'form-height' || data.type === 'leadConnector.formHeight') {
        resize(event.source, data.height)
        return
      }
      if (typeof data.height === 'number') resize(event.source, data.height)
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (!pageLoaded || !embedScripts.length) return null

  return (
    <div className="w-full">
      {embedScripts.map((sc, i) => (
        <div key={sc.script_id ?? i} className="w-full max-w-full">
          <iframe
            ref={(el) => { iframeRefs.current[sc.script_id ?? i] = el }}
            src={sc.script_src}
            id={sc.script_id ? `embed-${sc.script_id}` : `embed-${i}`}
            className="block w-full border-none bg-transparent"
            style={{ minHeight: '500px' }}
            scrolling="no"
            loading="lazy"
            allowTransparency={true}
          />
        </div>
      ))}
    </div>
  )
}
