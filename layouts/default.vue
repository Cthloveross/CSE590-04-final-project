<script setup lang="ts">
import { navigateTo, useRoute } from 'nuxt/app'
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

const auth = useAuthStore()
const cart = useCartStore()
const route = useRoute()
const links = [
  { name: 'Catalog', to: '/' },
  { name: 'Auctions', to: '/games/cs2' },
  { name: 'Orders', to: '/orders', auth: true },
  { name: 'Admin', to: '/admin/services', admin: true },
]

const currentYear = new Date().getFullYear()
const isHydrated = ref(false)

const isActiveLink = (to: string) => {
  if (to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(to)
}

onMounted(async () => {
  isHydrated.value = true
  await auth.fetchProfile().catch(() => undefined)
  if (auth.isAuthenticated) {
    await cart.load().catch(() => undefined)
  }
})

watch(
  () => auth.isAuthenticated,
  async (loggedIn) => {
    if (!isHydrated.value) return
    if (loggedIn) {
      await cart.load().catch(() => undefined)
    } else {
      cart.clear()
    }
  }
)

const logout = async () => {
  await auth.logout()
  cart.clear()
  await navigateTo('/login')
}
</script>

<template>
  <div class="bg-slate-950 text-slate-100 min-h-screen">
    <header class="border-b border-white/10 bg-slate-900/60 backdrop-blur">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div class="flex items-center gap-3">
          <IconGamepad class="h-8 w-8 text-brand" />
          <div>
            <p class="text-lg font-semibold">Game Services Auctions</p>
            <p class="text-sm text-slate-400">Bid on boosts, coaching, and more</p>
          </div>
        </div>
        <nav class="flex items-center gap-4 text-sm">
          <template v-for="link in links" :key="link.to">
            <NuxtLink
              v-if="(!link.auth || auth.isAuthenticated) && (!link.admin || auth.isAdmin)"
              :to="link.to"
              class="rounded-md px-3 py-2 hover:bg-white/10"
              :class="{ 'bg-brand/20 text-brand-light': isActiveLink(link.to) }"
            >
              {{ link.name }}
            </NuxtLink>
          </template>
          <NuxtLink
            to="/cart"
            class="relative rounded-md px-3 py-2 hover:bg-white/10"
            :class="{ 'bg-brand/20 text-brand-light': route.path.startsWith('/cart') }"
          >
            Cart
            <span
              v-if="isHydrated && cart.items.length"
              class="absolute -right-2 -top-1 rounded-full bg-brand px-1.5 text-xs text-white"
            >
              {{ cart.items.length }}
            </span>
          </NuxtLink>
          <template v-if="isHydrated">
            <button
              v-if="auth.isAuthenticated"
              class="rounded-md px-3 py-2 text-sm text-slate-300 hover:text-white"
              @click="logout"
            >
              Logout
            </button>
            <NuxtLink
              v-else
              to="/login"
              class="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              Login
            </NuxtLink>
          </template>
          <NuxtLink
            v-else
            to="/login"
            class="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Login
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-8">
      <slot />
    </main>

    <footer class="border-t border-white/10 px-4 py-6 text-center text-xs text-slate-500">
      Built with Nuxt 3, MongoDB, Tailwind CSS · {{ currentYear }}
    </footer>
  </div>
</template>
