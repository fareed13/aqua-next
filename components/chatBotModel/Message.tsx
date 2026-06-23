'use client'

import Image from 'next/image'
import { ThumbsUp, ThumbsDown } from 'lucide-react'
import { useState } from 'react'
import { useOrgStore } from '@/store/orgStore'

interface Props {
  sender: string
  message: string
  avatar: string
  id: number
  liked?: boolean | null
  onLikeToggle?: (index: number, liked: boolean | null) => void
}

export function Message({ sender, message, avatar, id, liked: likedProp = null, onLikeToggle }: Props) {
  const organization = useOrgStore((s) => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-color'] ?? '#124e66'
  const chatbotConfig = (organization as any)?.chatbot_config?.[0]
  const avatarBg = chatbotConfig?.color?.bg ?? '#124e66'

  const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? ''
  const avatarLogo = chatbotConfig?.avatar
    ? `${MEDIA_URL}${chatbotConfig.avatar.uuid}_350.${chatbotConfig.avatar.extension ?? ''}`
    : (organization as any)?.primary_logo
      ? `${MEDIA_URL}/${(organization as any).primary_logo.uuid}_350.${(organization as any).primary_logo.extension}`
      : ''

  const [liked, setLiked] = useState<boolean | null>(likedProp)
  const isUser = sender === 'User'

  const getCurrentTime = () =>
    new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })

  const toggle = (direction: 'up' | 'down') => {
    const next = direction === 'up'
      ? (liked === true ? null : true)
      : (liked === false ? null : false)
    setLiked(next)
    onLikeToggle?.(id, next)
  }

  return (
    <div className={`flex flex-col mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      {isUser && <p className="text-xs text-gray-500 mb-1 mr-1">You</p>}

      <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
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
        )}

        <div
          className="max-w-xs px-4 py-3 rounded-2xl shadow-sm"
          style={{ backgroundColor: isUser ? accentColor : 'white' }}
        >
          <p className={`text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-800'}`}>{message}</p>
          <p className={`text-xs mt-1 ${isUser ? 'text-white/70' : 'text-gray-400'}`}>{getCurrentTime()}</p>
        </div>
      </div>

      {!isUser && (
        <div className="flex gap-1 mt-1 ml-12">
          <button
            onClick={() => toggle('down')}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            style={{ color: liked === false ? accentColor : '#9ca3af' }}
          >
            <ThumbsDown size={14} />
          </button>
          <button
            onClick={() => toggle('up')}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            style={{ color: liked === true ? accentColor : '#9ca3af' }}
          >
            <ThumbsUp size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
