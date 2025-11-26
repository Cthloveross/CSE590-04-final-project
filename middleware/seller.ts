import { defineNuxtRouteMiddleware, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  if (!auth.user) {
    try {
      await auth.fetchProfile()
    } catch {
      /* ignore */
    }
  }

  // Allow sellers and admins
  if (!auth.isSeller && !auth.isAdmin) {
    return navigateTo('/')
  }
})

