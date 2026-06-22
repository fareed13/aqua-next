'use client'

import { useEffect } from 'react'
import { useOrgStore } from '@/store/orgStore'

const WIDGET_SCRIPT_URL = 'https://widgets.leadconnectorhq.com/loader.js'
const WIDGET_RESOURCE = 'https://widgets.leadconnectorhq.com/chat-widget/loader.js'

export function Widgets() {
  const domain = useOrgStore((s) => s.domain)

  useEffect(() => {
    if (domain !== 'cantonckd.com') return
    if (document.querySelector(`script[src="${WIDGET_SCRIPT_URL}"]`)) return

    const script = document.createElement('script')
    script.src = WIDGET_SCRIPT_URL
    script.async = true
    script.setAttribute('data-resources-url', WIDGET_RESOURCE)
    document.body.appendChild(script)

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script)
    }
  }, [domain])

  if (domain !== 'cantonckd.com') return null

  return (
    <div>
      {/* @ts-expect-error — chat-widget is a third-party custom element */}
      <chat-widget
        style={{
          '--chat-widget-primary-color': '#188BF6',
          '--chat-widget-active-color': '#188bf6',
          '--chat-widget-bubble-color': '#188BF6',
        }}
        location-id="T4lcKgQG92uLAqRPbI0k"
        heading="Want Two Weeks Of Free Martial Arts Classes?"
        sub-heading="Enter your info to get Two Weeks Of Free Martial Arts Classes, before this offer ends."
        prompt-msg="Want Two Weeks Of Free Martial Arts Classes? Click here"
        enable-revisit-message="false"
        support-contact="(470) 646-3976"
        prompt-avatar="https://widgets.leadconnectorhq.com/chat-widget/assets/defaultAvatar.png"
        agency-name="Madscope Marketing"
        agency-website="www.MadscopeMarketing.com"
      />
    </div>
  )
}
