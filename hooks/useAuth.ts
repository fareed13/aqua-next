'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { useOrgStore } from '@/store/orgStore'
import { useUiStore } from '@/store/uiStore'

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((c) => c.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

function deleteCookie(name: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

export function useAuth() {
  const router = useRouter()
  const userToken = useAuthStore((s) => s.userToken)
  const userRole = useAuthStore((s) => s.userRole)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const setSettingsVisibleSection = useUiStore((s) => s.setSettingsVisibleSection)

  const isLoggedIn = useCallback(() => {
    return !!userToken || !!getCookie('auth._token.local')
  }, [userToken])

  const getUser = useCallback(() => {
    if (!isLoggedIn()) return null
    const cookieUser = getCookie('user')
    if (cookieUser) {
      try { return JSON.parse(cookieUser) } catch { return null }
    }
    return userRole ? { role: userRole } : null
  }, [isLoggedIn, userRole])

  const isAdminLoggedIn = useCallback(() => {
    if (!isLoggedIn()) return false
    const user = getUser()
    return !!user && (user.role === 'org-admin' || user.role === 'superadmin')
  }, [isLoggedIn, getUser])

  const isMemberLoggedIn = useCallback(() => {
    if (!isLoggedIn()) return false
    const user = getUser()
    return !!user && user.role === 'member'
  }, [isLoggedIn, getUser])

  const isSuperAdminLoggedIn = useCallback(() => {
    if (!isLoggedIn()) return false
    const user = getUser()
    return !!user && user.role === 'superadmin'
  }, [isLoggedIn, getUser])

  const isStatusMember = useCallback(() => {
    if (!isLoggedIn()) return false
    const user = getUser()
    return !!user && user.role === 'member' && user.tags
  }, [isLoggedIn, getUser])

  const logOut = useCallback(() => {
    deleteCookie('auth._token.local')
    deleteCookie('user')
    setSettingsVisibleSection(null)
    clearAuth()
    router.push('/')
  }, [clearAuth, setSettingsVisibleSection, router])

  return {
    isLoggedIn,
    getUser,
    isAdminLoggedIn,
    isMemberLoggedIn,
    isSuperAdminLoggedIn,
    isStatusMember,
    logOut,
  }
}
