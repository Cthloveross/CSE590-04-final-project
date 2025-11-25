import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  if (!auth.user) {
    try {
      await auth.fetchProfile()
    } catch {
      /* ignore */
    }
  }

  if (!auth.isAuthenticated) {
    const redirect = to.fullPath && to.fullPath !== '/login' ? `?redirect=${encodeURIComponent(to.fullPath)}` : ''
    return navigateTo(`/login${redirect}`)
  }
})
