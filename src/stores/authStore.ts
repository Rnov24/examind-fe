import { create } from 'zustand'
import api from '@/lib/api'

export interface User {
  id: number
  identifier: string
  email: string
  full_name: string
  role: 'superadmin' | 'admin' | 'teacher' | 'student'
  tenant_id?: number
  tenant_name?: string
  avatar_url?: string
}

interface AuthState {
  token: string | null
  user: User | null
  isHydrated: boolean
  isAuthenticated: () => boolean
  isSuperAdmin: () => boolean
  isAdmin: () => boolean
  isTeacher: () => boolean
  isStudent: () => boolean
  login: (identifierOrPayload: string | { identifier?: string; username?: string; password?: string }, pwd?: string) => Promise<User>
  fetchProfile: () => Promise<void>
  logout: () => void
  hydrate: () => void
}

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem('examind_token')
  } catch {
    return null
  }
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('examind_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isHydrated: false,

  isAuthenticated: () => !!get().token && !!get().user,
  isSuperAdmin: () => get().user?.role === 'superadmin',
  isAdmin: () => get().user?.role === 'admin',
  isTeacher: () => {
    const role = get().user?.role
    return role === 'teacher' || role === 'admin' || role === 'superadmin'
  },
  isStudent: () => get().user?.role === 'student',

  hydrate: () => {
    const token = getStoredToken()
    const user = getStoredUser()
    set({ token, user, isHydrated: true })
  },

  login: async (identifierOrPayload, pwd) => {
    let identifier = ''
    let password = ''
    if (typeof identifierOrPayload === 'string') {
      identifier = identifierOrPayload
      password = pwd || ''
    } else if (identifierOrPayload && typeof identifierOrPayload === 'object') {
      identifier = identifierOrPayload.identifier || identifierOrPayload.username || ''
      password = identifierOrPayload.password || pwd || ''
    }

    const res = await api.post('/auth/login', { identifier: identifier.trim(), password })
    const data = res.data.data
    const accessToken = data.access_token
    const userData: User = data.user

    if (typeof window !== 'undefined') {
      localStorage.setItem('examind_token', accessToken)
      localStorage.setItem('examind_user', JSON.stringify(userData))
    }

    set({ token: accessToken, user: userData, isHydrated: true })
    return userData
  },

  fetchProfile: async () => {
    const token = get().token || getStoredToken()
    if (!token) return
    try {
      const res = await api.get('/auth/me')
      const userData: User = res.data.data
      if (typeof window !== 'undefined') {
        localStorage.setItem('examind_user', JSON.stringify(userData))
      }
      set({ user: userData })
    } catch {
      get().logout()
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('examind_token')
      localStorage.removeItem('examind_user')
    }
    set({ token: null, user: null })
  },
}))
