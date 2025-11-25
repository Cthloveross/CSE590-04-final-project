import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { UserProfile } from '~/types/entities'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<UserProfile | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

    const isAuthenticated = computed(() => Boolean(user.value))
    const isAdmin = computed(() => user.value?.role === 'admin')

    const fetchProfile = async () => {
      const data = await $fetch<UserProfile | null>('/api/auth/me')
      user.value = data
      return data
    }

    const login = async (payload: { email: string; password: string }) => {
      loading.value = true
      error.value = null
      console.log('🟢 Auth store login called with:', payload.email)
      try {
        console.log('🟢 Sending request to /api/auth/login')
        const response = await $fetch('/api/auth/login', {
          method: 'POST',
          body: payload,
        })
        console.log('🟢 Login API response:', response)
        console.log('🟢 Fetching profile...')
        await fetchProfile()
        console.log('🟢 Profile fetched successfully')
      } catch (err: any) {
        console.error('🔴 Auth store login error:', err)
        console.error('🔴 Error details:', {
          message: err?.message,
          statusCode: err?.statusCode,
          data: err?.data,
        })
        error.value = err?.data?.message || err?.message || 'Login failed'
        throw err
      } finally {
        loading.value = false
      }
    }

    const register = async (payload: {
      username: string
      email: string
      password: string
      confirmPassword: string
    }) => {
      loading.value = true
      error.value = null
      try {
        await $fetch('/api/auth/register', {
          method: 'POST',
          body: payload,
        })
        await fetchProfile()
      } catch (err: any) {
        error.value = err?.data?.message || err?.message || 'Registration failed'
        throw err
      } finally {
        loading.value = false
      }
    }

    const logout = async () => {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
    }

    return {
      user,
      loading,
      error,
      isAuthenticated,
      isAdmin,
      fetchProfile,
      login,
      register,
      logout,
    }
  },
  {
    persist: {
      pick: ['user'],
    },
  }
)
