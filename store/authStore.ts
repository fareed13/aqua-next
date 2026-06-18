import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface AuthState {
  userToken: string
  sessionUser: string
  userRole: string | null
  resetPasswordRequired: boolean

  setUserToken: (token: string) => void
  setSessionUser: (user: string) => void
  setUserRole: (role: string | null) => void
  setResetPasswordRequired: (required: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  immer((set) => ({
    userToken: '',
    sessionUser: '',
    userRole: null,
    resetPasswordRequired: false,

    setUserToken: (token) => set((state) => { state.userToken = token }),
    setSessionUser: (user) => set((state) => { state.sessionUser = user }),
    setUserRole: (role) => set((state) => { state.userRole = role }),
    setResetPasswordRequired: (required) => set((state) => { state.resetPasswordRequired = required }),
    clearAuth: () => set((state) => {
      state.userToken = ''
      state.sessionUser = ''
      state.userRole = null
      state.resetPasswordRequired = false
    }),
  }))
)
