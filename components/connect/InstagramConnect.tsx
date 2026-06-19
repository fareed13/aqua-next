'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

const INSTA_CLIENT_ID = process.env.NEXT_PUBLIC_INSTA_CLIENT_ID ?? ''
const INSTA_REDIRECT_UI = process.env.NEXT_PUBLIC_INSTA_REDIRECT_UI ?? ''

export function InstagramConnect() {
  const { isAdminLoggedIn } = useAuth()
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const err = params.get('error')
    if (err) {
      setError('Something went wrong, Please login to continue')
    }
    if (!isAdminLoggedIn()) {
      setError('Unauthorized. Please log in as an admin.')
    }
  }, [isAdminLoggedIn])

  const loginWithInstagram = () => {
    const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&state=${window.location.origin}&client_id=${INSTA_CLIENT_ID}&redirect_uri=${INSTA_REDIRECT_UI}&response_type=code&scope=instagram_business_basic`
    window.location.href = authUrl
  }

  return (
    <div className="flex flex-col items-center justify-center" style={{ height: '80vh' }}>
      {error && <p className="mb-8 text-xl">{error}</p>}
      {isAdminLoggedIn() && (
        <button
          onClick={loginWithInstagram}
          className="text-white border-none px-5 py-3 rounded cursor-pointer text-base hover:opacity-90"
          style={{ backgroundColor: '#c13584' }}
        >
          Login with Instagram
        </button>
      )}
    </div>
  )
}
