'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import { ChatBot } from './ChatBot'
import { Message } from './Message'
import { useOrgStore } from '@/store/orgStore'
import { useNonSecureCalls, NON_SECURE_ENDPOINTS } from '@/hooks/apiCalls/useApiCalls'

const WS_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL ?? ''

function getWsToken(orgId: number, sessionId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`${WS_URL}/token/${orgId}/${sessionId}/`)
    ws.onopen = () => ws.send(JSON.stringify({ tokenRequired: 'True' }))
    ws.onmessage = (e) => {
      try { ws.close() } catch {}
      resolve(JSON.parse(e.data).token)
    }
    ws.onerror = (err) => reject(err)
  })
}

function getUserSessionId(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.split('; ').find(c => c.startsWith('user_session_id='))
  if (match) return match.split('=')[1]
  const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
  document.cookie = `user_session_id=${id}; path=/; max-age=${60 * 60 * 24 * 365}`
  return id
}

interface ChatMessage {
  sender: 'User' | 'Bot'
  text: string
  avatar: string
  isliked?: boolean | null
  session_Id?: string
}

function getChatbotSessionId(): string {
  if (typeof document === 'undefined') return ''
  const match = document.cookie.split('; ').find((c) => c.startsWith('user_session_for_chatbot='))
  return match ? match.split('=')[1] : ''
}

function initChatbotSession(): string {
  let id = getChatbotSessionId()
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36)
    document.cookie = `user_session_for_chatbot=${id}; path=/; max-age=${60 * 60 * 24 * 30}`
  }
  return id
}

export function ChatContainer() {
  const organization = useOrgStore((s) => s.organization)
  const orgId = useOrgStore((s) => s.organization?.id)
  const isUk = (organization as any)?.is_uk ?? false
  const chatbotConfig = (organization as any)?.chatbot_config?.[0]
  const recaptchaEnabled = (organization as any)?.recaptcha_enabled ?? false

  const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
  const avatarLogo = chatbotConfig?.avatar
    ? `${MEDIA_URL}${chatbotConfig.avatar.uuid}_350.${chatbotConfig.avatar.extension ?? ''}`
    : (organization as any)?.primary_logo
      ? `${MEDIA_URL}/${(organization as any).primary_logo.uuid}_350.${(organization as any).primary_logo.extension}`
      : ''

  const variations = chatbotConfig?.greeting_variations ?? []
  const greetingMessage = variations.length ? variations[Math.floor(Math.random() * variations.length)] : null

  const { postPublic, postPublicProtected, nonSecureEndpoint } = useNonSecureCalls()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [botTyping, setBotTyping] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const recaptchaTokenRef = useRef<string | null>(null)

  useEffect(() => { initChatbotSession() }, [])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight
    }, 200)
  }, [])

  const getResponse = async (query: string) => {
    setBotTyping(true)
    try {
      const sessionId = getUserSessionId()
      let authHeader = ''
      if (recaptchaEnabled) {
        const storedToken = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('recaptcha_token') : null
        authHeader = recaptchaTokenRef.current ?? storedToken ?? ''
      } else {
        const wsToken = await getWsToken(orgId!, sessionId)
        authHeader = `Bearer ${wsToken}`
      }
      const data = { session_id: getChatbotSessionId(), client_question: query }
      const res = await postPublicProtected(nonSecureEndpoint.CHATBOT, data, authHeader) as any

      setMessages((prev) => [
        ...prev,
        { sender: 'Bot', text: res.response_for_client, avatar: avatarLogo, isliked: null },
      ])
      scrollToBottom()
    } catch (e) {
      console.error(e)
    } finally {
      setBotTyping(false)
    }
  }

  const msgSend = (value: string) => {
    if (botTyping) return
    setMessages((prev) => [
      ...prev,
      { sender: 'User', text: value, avatar: 'user_avatar.png', session_Id: getChatbotSessionId() },
    ])
    scrollToBottom()
    getResponse(value)
  }

  const toggleLiked = async (index: number, liked: boolean | null) => {
    setMessages((prev) => prev.map((m, i) => i === index ? { ...m, isliked: liked } : m))
    try {
      const questionMsg = messages[index - 1]
      const answerMsg = messages[index]
      await postPublic(nonSecureEndpoint.CHATBOT_MESSAGE_REACTION, {
        question: questionMsg?.text,
        answer: answerMsg?.text,
        isliked: liked,
        session_Id: questionMsg?.session_Id ?? null,
      })
    } catch (e) {
      console.error(e)
    }
  }

  const avatarBg = chatbotConfig?.color?.bg ?? '#124e66'

  return (
    <div className="h-full">
      <ChatBot
        onNewMessage={msgSend}
        onRecaptchaVerified={(token) => {
          recaptchaTokenRef.current = token
          scrollToBottom()
        }}
      >
        <div ref={containerRef} className="space-y-2 h-full overflow-y-auto">
          {/* Welcome message */}
          <div className="flex items-end gap-2 mb-4">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
              style={{ backgroundColor: avatarBg }}
            >
              {avatarLogo ? (
                <Image src={avatarLogo} alt="Bot avatar" width={40} height={40} className="object-contain" />
              ) : (
                <span className="text-white text-xs font-bold">AI</span>
              )}
            </div>
            <div className="bg-white px-4 py-3 rounded-2xl shadow-sm max-w-xs">
              <p className="text-sm text-gray-800">
                {greetingMessage ?? `Hello, what ${isUk ? 'programme' : 'program'} are you interested in?`}
              </p>
              <p className="text-xs text-gray-400 mt-1">Just now</p>
            </div>
          </div>

          {/* Messages */}
          {messages.map((msg, i) => (
            <Message
              key={i}
              sender={msg.sender}
              message={msg.text}
              avatar={msg.avatar}
              id={i}
              liked={msg.isliked}
              onLikeToggle={toggleLiked}
            />
          ))}

          {/* Typing indicator */}
          {botTyping && (
            <div className="flex items-end gap-2">
              <div
                className="w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: avatarBg }}
              >
                {avatarLogo ? (
                  <Image src={avatarLogo} alt="Bot" width={40} height={40} className="object-contain" />
                ) : (
                  <span className="text-white text-xs font-bold">AI</span>
                )}
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl shadow-sm">
                <div className="flex gap-1 items-center h-4">
                  {[0, 1, 2].map((dot) => (
                    <div
                      key={dot}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${dot * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ChatBot>
    </div>
  )
}
