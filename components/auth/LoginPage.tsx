'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
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
    <div className="max-w-[550px] mx-auto mt-[140px] mb-[50px] max-[767px]:mt-[150px] max-[767px]:max-w-[280px] max-[767px]:px-5">
      <h3 className="text-[33px] text-center mb-5">Log In</h3>
      <p className="text-[25px] text-center uppercase tracking-wider font-medium mt-2">Welcome Back!</p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
          <div className="relative flex items-center bg-white rounded shadow-sm">
            <Mail size={20} className="absolute left-3 text-black/60 pointer-events-none" />
            <input
              id="email"
              type="email"
              className="w-full rounded pl-11 pr-3 py-3 bg-transparent focus:outline-none"
              value={email}
              onChange={e => setEmail(e.target.value.toLowerCase())}
              required
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
          <div className="relative flex items-center bg-white rounded shadow-sm">
            <Lock size={20} className="absolute left-3 text-black/60 pointer-events-none" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="w-full rounded pl-11 pr-11 py-3 bg-transparent focus:outline-none"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 text-black/60"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="text-right mt-1 -mb-2">
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
              disabled={loading}
              className="w-[130px] h-[45px] border-2 rounded font-semibold disabled:opacity-50 max-[767px]:w-[100px] max-[767px]:h-[40px] max-[767px]:text-xs"
              style={{ borderColor: accentColor, color: accentColor }}
            >
              Join now
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-[130px] h-[45px] flex items-center justify-center gap-2 text-white rounded font-semibold disabled:opacity-50 max-[767px]:w-[100px] max-[767px]:h-[40px] max-[767px]:text-xs"
            style={{ backgroundColor: accentColor }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Log In
          </button>
        </div>
      </form>
    </div>
  )
}
