import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import type { UserProfile } from '~/types/entities'

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  // If user is already in store, check role directly
  if (auth.user) {
    if (!auth.isAdmin) {
      return navigateTo('/')
    }
    return
  }

  // On SSR or when store is empty, fetch profile with proper cookie forwarding
  try {
    const requestFetch = useRequestFetch()
    const profile = await requestFetch<UserProfile | null>('/api/auth/me')
    
    if (profile) {
      auth.user = profile
      // Check if user is admin
      if (profile.role !== 'admin') {
        return navigateTo('/')
      }
      return
    }
  } catch {
    /* ignore fetch errors */
  }

  // Not authenticated or not admin
  return navigateTo('/')
})
