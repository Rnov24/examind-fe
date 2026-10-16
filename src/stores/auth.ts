import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
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

function getInitialUser(): User | null {
  try {
    const raw = localStorage.getItem('examind_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    localStorage.removeItem('examind_user')
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('examind_token'))
  const user = ref<User | null>(getInitialUser())

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isSuperAdmin = computed(() => user.value?.role === 'superadmin')
  const isTeacher = computed(() => user.value?.role === 'teacher' || user.value?.role === 'admin' || user.value?.role === 'superadmin')
  const isStudent = computed(() => user.value?.role === 'student')
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(
    identifierOrPayload: string | { identifier?: string; username?: string; password?: string },
    pwd?: string
  ): Promise<User> {
    let identifier = ''
    let password = ''
    if (typeof identifierOrPayload === 'object' && identifierOrPayload !== null) {
      identifier = identifierOrPayload.identifier || identifierOrPayload.username || ''
      password = identifierOrPayload.password || pwd || ''
    } else {
      identifier = identifierOrPayload
      password = pwd || ''
    }
    const res = await api.post('/auth/login', { identifier: identifier.trim(), password })
    const data = res.data.data
    token.value = data.access_token
    user.value = data.user

    localStorage.setItem('examind_token', data.access_token)
    localStorage.setItem('examind_user', JSON.stringify(data.user))

    return data.user
  }

  async function fetchProfile(): Promise<void> {
    if (!token.value) return
    try {
      const res = await api.get('/auth/me')
      user.value = res.data.data
      localStorage.setItem('examind_user', JSON.stringify(res.data.data))
    } catch {
      logout()
    }
  }

  function logout(): void {
    token.value = null
    user.value = null
    localStorage.removeItem('examind_token')
    localStorage.removeItem('examind_user')
  }

  return {
    token,
    user,
    isAuthenticated,
    isSuperAdmin,
    isTeacher,
    isStudent,
    isAdmin,
    login,
    fetchProfile,
    logout,
  }
})
