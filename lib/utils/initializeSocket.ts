'use client'

export async function initializeSocket(orgId: number): Promise<string> {
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL
  if (!wsUrl) return ''

  const sessionId =
    typeof document !== 'undefined'
      ? (document.cookie
          .split('; ')
          .find((c) => c.startsWith('user_session_id='))
          ?.split('=')[1] ?? Math.random().toString(36).slice(2))
      : Math.random().toString(36).slice(2)

  const url = `${wsUrl}/token/${orgId}/${sessionId}/`

  return new Promise((resolve) => {
    try {
      const ws = new WebSocket(url)
      const timeout = setTimeout(() => {
        try { ws.close() } catch {}
        resolve('')
      }, 10000)

      ws.onopen = () => ws.send(JSON.stringify({ tokenRequired: 'True' }))

      ws.onmessage = (event) => {
        clearTimeout(timeout)
        try {
          const data = JSON.parse(event.data)
          try { ws.close() } catch {}
          resolve(data.token ?? '')
        } catch {
          try { ws.close() } catch {}
          resolve('')
        }
      }

      ws.onerror = () => {
        clearTimeout(timeout)
        resolve('')
      }
    } catch {
      resolve('')
    }
  })
}

export async function getPublicAuthHeader(orgId: number, recaptchaEnabled: boolean): Promise<string> {
  if (recaptchaEnabled) {
    const token =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('recaptcha_token')
        : null
    return token ?? ''
  }
  const rawToken = await initializeSocket(orgId)
  return rawToken ? `Bearer ${rawToken}` : ''
}
