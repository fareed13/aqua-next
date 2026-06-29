'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'
import { useNonSecureCalls, NON_SECURE_ENDPOINTS } from './apiCalls/useApiCalls'

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Strict`
}

export function useLogin() {
  const router = useRouter()
  const organization = useOrgStore(s => s.organization)
  const setUserToken = useAuthStore(s => s.setUserToken)
  const setUserRole = useAuthStore(s => s.setUserRole)
  const setDialog = useUiStore(s => s.setDialog)
  const { postPublic, putPublic } = useNonSecureCalls()

  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [code, setCode] = useState('')
  const [confirmCode, setConfirmCode] = useState(false)
  const [isLoginFormValid, setIsLoginFormValid] = useState(true)

  const emailRules = [
    (v: string) => !!v || 'Email is required',
    (v: string) => /.+@.+/.test(v) || 'Email must be valid',
  ]

  const showSignupPopup = useCallback(() => {
    setDialog(true)
  }, [setDialog])

  const submitForm = useCallback(async (loginInfo: {
    email: string
    password: string
    new_password?: string
  }) => {
    try {
      setLoading(true)
      const response: any = await postPublic(
        NON_SECURE_ENDPOINTS.USER_LOGIN_END_POINT,
        {
          username: loginInfo.email,
          password: loginInfo.password,
          new_password: loginInfo.new_password,
          organization_id: organization?.id,
        }
      )

      setCookie('user', JSON.stringify(response.user))
      const bearerToken = `Bearer ${response.token}`
      setCookie('auth._token.local', bearerToken)
      setUserToken(bearerToken)
      setUserRole(response.user.role)

      if (response.user.role === 'superadmin' || response.user.role === 'org-admin') {
        router.push('/admin/dashboard/')
      } else {
        router.push('/')
      }
      setLoading(false)
    } catch {
      setLoading(false)
    }
  }, [organization, postPublic, setUserToken, setUserRole, router])

  const forgotPasswordClicked = useCallback(async () => {
    if (!email) return
    setLoading(true)
    try {
      await putPublic(NON_SECURE_ENDPOINTS.USER_LOGIN_END_POINT, {
        username: email,
      })
      setLoading(false)
      setConfirmCode(true)
    } catch {
      setLoading(false)
    }
  }, [email, putPublic])

  const confirmCodeClicked = useCallback(async () => {
    if (!email || !code || !newPassword) return
    setLoading(true)
    try {
      await putPublic(NON_SECURE_ENDPOINTS.USER_LOGIN_END_POINT, {
        username: email,
        code,
        newPassword,
      })
      setLoading(false)
      router.push('/login')
    } catch {
      setLoading(false)
    }
  }, [email, code, newPassword, putPublic, router])

  return {
    loading,
    email,
    setEmail,
    password,
    setPassword,
    newPassword,
    setNewPassword,
    code,
    setCode,
    confirmCode,
    isLoginFormValid,
    emailRules,
    showSignupPopup,
    submitForm,
    forgotPasswordClicked,
    confirmCodeClicked,
  }
}
