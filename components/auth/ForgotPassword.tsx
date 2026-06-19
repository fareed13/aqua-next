'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLogin } from '@/hooks/useLogin'
import { useOrgStore } from '@/store/orgStore'

export function ForgotPassword() {
  const organization = useOrgStore(s => s.organization)
  const accentColor = organization?.colors?.['app-main-accent-with-transparent'] ?? '#d5242c'

  const {
    loading, email, setEmail, newPassword, setNewPassword,
    code, setCode, confirmCode,
    forgotPasswordClicked, confirmCodeClicked,
  } = useLogin()

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="max-w-[550px] mx-auto mt-[100px] max-[767px]:mt-[150px] max-[767px]:max-w-[280px] max-[767px]:px-5">
      <h3 className="text-[33px] text-center mb-5 max-[767px]:text-[22px]">Forgot your password?</h3>
      {!confirmCode && (
        <p className="text-[20px] text-center uppercase tracking-wider font-medium mt-2 max-[767px]:text-sm">
          Please enter your email and we&apos;ll reset it.
        </p>
      )}

      <div className="mt-10 space-y-4">
        {!confirmCode ? (
          <div>
            <label className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={email}
              onChange={e => setEmail(e.target.value.toLowerCase())}
              autoComplete="email"
            />
          </div>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Verification Code</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border rounded px-3 py-2 pr-10"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-center gap-5 mt-10">
          <Link
            href="/"
            className="inline-flex items-center justify-center w-[190px] h-[45px] border-2 rounded font-semibold no-underline max-[767px]:w-[100px] max-[767px]:h-[40px]"
            style={{ borderColor: accentColor, color: accentColor }}
          >
            Cancel
          </Link>
          <button
            onClick={confirmCode ? confirmCodeClicked : forgotPasswordClicked}
            disabled={loading}
            className="w-[190px] h-[45px] text-white rounded font-semibold disabled:opacity-50 max-[767px]:w-[100px] max-[767px]:h-[40px]"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>

        <div className="text-center mt-12">
          <Link href="/login" className="underline capitalize">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
