'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { useOrgStore } from '@/store/orgStore'
import { useRecaptcha } from '@/hooks/useRecaptcha'
import { useNonSecureCalls } from '@/hooks/apiCalls/useApiCalls'

interface Props {
  headerTitle?: string
  children?: React.ReactNode
  onNewMessage: (msg: string) => void
  onRecaptchaVerified?: () => void
}

export function ChatBot({ headerTitle = 'Chatbot', children, onNewMessage, onRecaptchaVerified }: Props) {
  const organization = useOrgStore((s) => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#124e66'
  const recaptchaEnabled = (organization as any)?.recaptcha_enabled ?? false

  const { recaptchaReady, loadRecaptchaScript, getSiteKey } = useRecaptcha()
  const { postPublic, nonSecureEndpoint } = useNonSecureCalls()

  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const recaptchaContainerRef = useRef<HTMLDivElement>(null)
  const recaptchaWidgetId = useRef<number | null>(null)

  const hasValidRecaptcha = !recaptchaEnabled || !!recaptchaToken

  useEffect(() => {
    if (recaptchaEnabled && !hasValidRecaptcha && !recaptchaReady) {
      loadRecaptchaScript()
    }
  }, [recaptchaEnabled])

  useEffect(() => {
    if (!recaptchaReady || !recaptchaEnabled || !recaptchaContainerRef.current) return
    if (recaptchaWidgetId.current !== null) return

    const g = (window as any).grecaptcha
    if (!g) return

    recaptchaWidgetId.current = g.render(recaptchaContainerRef.current, {
      sitekey: getSiteKey(),
      callback: async (token: string) => {
        try {
          const res = await postPublic(nonSecureEndpoint.GOOGLERECAPTCHA, { token }) as any
          if (res.success) {
            setRecaptchaToken(token)
            onRecaptchaVerified?.()
          } else {
            setRecaptchaToken(null)
          }
        } catch {
          setRecaptchaToken(null)
        }
      },
      'expired-callback': () => setRecaptchaToken(null),
      'error-callback': () => setRecaptchaToken(null),
    })
  }, [recaptchaReady])

  const send = () => {
    const text = newMessage.trim()
    if (!text) return
    onNewMessage(text)
    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
        {hasValidRecaptcha ? (
          children
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="bg-white rounded-xl shadow-md p-6 max-w-sm w-full text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="text-[#124e66] font-semibold">Security Verification</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">Please verify you&apos;re human to continue the conversation</p>
              <div ref={recaptchaContainerRef} className="flex justify-center" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t p-3 bg-white flex-shrink-0">
        <div className="flex items-center gap-2 border rounded-full px-4 py-2" style={{ borderColor: accentColor }}>
          <MessageSquare size={18} className="text-gray-400 flex-shrink-0" />
          <input
            className="flex-1 outline-none text-sm bg-transparent placeholder-gray-400"
            placeholder="Type your message here..."
            value={newMessage}
            disabled={!hasValidRecaptcha}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button
            onClick={send}
            disabled={!newMessage.trim() || !hasValidRecaptcha}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-50 transition-opacity flex-shrink-0"
            style={{ backgroundColor: accentColor }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
