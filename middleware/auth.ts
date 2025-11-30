import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import type { UserProfile } from '~/types/entities'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // If user is already in store (client-side hydration from persistence), we're good
  if (auth.user) {
    return
  }

  // On SSR or when store is empty, fetch profile with proper cookie forwarding
  try {
    // useRequestFetch forwards cookies during SSR
    const requestFetch = useRequestFetch()
    const profile = await requestFetch<UserProfile | null>('/api/auth/me')
    
    if (profile) {
      // Update the store with the fetched profile
      auth.user = profile
      return
    }
  } catch {
    /* ignore fetch errors */
  }

  // If still not authenticated, redirect to login
  if (!auth.isAuthenticated) {
    const redirect = to.fullPath && to.fullPath !== '/login' ? `?redirect=${encodeURIComponent(to.fullPath)}` : ''
    return navigateTo(`/login${redirect}`)
  }
})
