'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLogin } from '@/hooks/useLogin'
import { useOrgStore } from '@/store/orgStore'

interface LoginPageProps {
  allowSignup?: boolean
}

export function LoginPage({ allowSignup = false }: LoginPageProps) {
  const organization = useOrgStore(s => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-with-transparent'] ?? '#d5242c'

  const {
    loading, email, setEmail, password, setPassword,
    submitForm, showSignupPopup,
  } = useLogin()

  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    submitForm({ email, password })
  }

  return (
    <div className="max-w-[550px] mx-auto mt-[140px] max-[767px]:mt-[150px] max-[767px]:max-w-[280px] max-[767px]:px-5">
      <h3 className="text-[33px] text-center mb-5">Log In</h3>
      <p className="text-[25px] text-center uppercase tracking-wider font-medium mt-2">Welcome Back!</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
          <input
            id="email"
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={e => setEmail(e.target.value.toLowerCase())}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="w-full border rounded px-3 py-2 pr-10"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="text-right mt-1">
            <Link href="/login/forgot-password" className="text-sm underline lowercase">
              forgot your password?
            </Link>
          </div>
        </div>

        <div className="flex justify-center gap-5 mt-10">
          {allowSignup && (
            <button
              type="button"
              onClick={showSignupPopup}
              className="w-[130px] h-[45px] border-2 rounded font-semibold max-[767px]:w-[100px] max-[767px]:h-[40px] max-[767px]:text-xs"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Join now
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-[130px] h-[45px] text-white rounded font-semibold disabled:opacity-50 max-[767px]:w-[100px] max-[767px]:h-[40px] max-[767px]:text-xs"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </div>
      </form>
    </div>
  )
}
