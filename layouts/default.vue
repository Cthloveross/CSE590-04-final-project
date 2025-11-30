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
  { name: 'Shop', to: '/games/cs2' },
  { name: 'Orders', to: '/orders', auth: true },
  { name: 'Sell', to: '/admin/services', seller: true },
]

// Admin dropdown menu items
const adminLinks = [
  { name: 'Users', to: '/admin/users', icon: '👥' },
  { name: 'Orders', to: '/admin/orders', icon: '📦' },
  { name: 'Services', to: '/admin/services', icon: '🎮' },
]

const showAdminMenu = ref(false)

const currentYear = new Date().getFullYear()
const isHydrated = ref(false)
const showUserMenu = ref(false)

const isActiveLink = (to: string) => {
  if (to === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(to)
}

const shouldShowLink = (link: typeof links[0]) => {
  if (link.auth && !auth.isAuthenticated) return false
  if (link.seller && !auth.isSeller) return false
  if (link.admin && !auth.isAdmin) return false
  return true
}

onMounted(async () => {
  isHydrated.value = true
  await auth.fetchProfile().catch(() => undefined)
  console.log('💰 User data after profile fetch:', auth.user)
  console.log('💰 Wallet balance:', auth.user?.walletBalance)
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
  showUserMenu.value = false
  await auth.logout()
  cart.clear()
  await navigateTo('/login')
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'admin':
      return { text: 'Admin', class: 'bg-rose-500/20 text-rose-300 border-rose-500/30' }
    case 'seller':
      return { text: 'Seller', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' }
    default:
      return { text: 'Buyer', class: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <!-- Ambient background -->
    <div class="fixed inset-0 -z-10 overflow-hidden">
      <div class="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-brand/5 blur-[100px]"></div>
      <div class="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-cyan-500/5 blur-[100px]"></div>
    </div>

    <header class="sticky top-0 z-50 border-b border-white/5 bg-slate-900/80 backdrop-blur-xl">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-cyan-500 shadow-lg shadow-brand/25 transition-transform group-hover:scale-105">
            <IconGamepad class="h-5 w-5 text-white" />
          </div>
          <div class="hidden sm:block">
            <p class="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              GameBoost
            </p>
            <p class="text-xs text-slate-500">CS2 Services Marketplace</p>
          </div>
        </NuxtLink>

        <nav class="flex items-center gap-1">
          <template v-for="link in links" :key="link.to">
            <NuxtLink
              v-if="isHydrated && shouldShowLink(link)"
              :to="link.to"
              class="rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-white/5"
              :class="{ 
                'bg-brand/10 text-brand-light': isActiveLink(link.to),
                'text-slate-400 hover:text-white': !isActiveLink(link.to)
              }"
            >
              {{ link.name }}
            </NuxtLink>
          </template>
          
          <!-- Admin Dropdown -->
          <div v-if="isHydrated && auth.isAdmin" class="relative">
            <button
              @click="showAdminMenu = !showAdminMenu"
              class="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-white/5"
              :class="{
                'bg-rose-500/10 text-rose-300': route.path.startsWith('/admin'),
                'text-slate-400 hover:text-white': !route.path.startsWith('/admin')
              }"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-if="showAdminMenu"
                class="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-white/10 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur-xl"
                @click.away="showAdminMenu = false"
              >
                <NuxtLink
                  v-for="adminLink in adminLinks"
                  :key="adminLink.to"
                  :to="adminLink.to"
                  class="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5"
                  :class="{
                    'bg-rose-500/10 text-rose-300': route.path === adminLink.to,
                    'text-slate-300 hover:text-white': route.path !== adminLink.to
                  }"
                  @click="showAdminMenu = false"
                >
                  <span>{{ adminLink.icon }}</span>
                  {{ adminLink.name }}
                </NuxtLink>
              </div>
            </Transition>
          </div>
          
          <!-- Wallet Balance -->
          <div v-if="isHydrated && auth.isAuthenticated" class="mr-2 flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-1.5 border border-brand/20">
            <svg class="h-4 w-4 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span class="text-sm font-semibold text-brand-light">${{ (auth.user?.walletBalance ?? 0).toFixed(2) }}</span>
          </div>

          <!-- Cart -->
          <NuxtLink
            to="/cart"
            class="relative rounded-lg p-2 text-slate-400 transition-all hover:bg-white/5 hover:text-white"
            :class="{ 'bg-brand/10 text-brand-light': route.path.startsWith('/cart') }"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span
              v-if="isHydrated && cart.items.length"
              class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-lg shadow-brand/50"
            >
              {{ cart.items.length }}
            </span>
          </NuxtLink>

          <!-- User Menu -->
          <template v-if="isHydrated">
            <div v-if="auth.isAuthenticated" class="relative ml-2">
              <button
                @click="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 rounded-lg p-1.5 transition-all hover:bg-white/5"
              >
                <div v-if="auth.user?.avatarUrl" class="h-8 w-8 overflow-hidden rounded-lg ring-2 ring-white/10">
                  <img :src="auth.user.avatarUrl" :alt="auth.user.username" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
                </div>
                <div v-else class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-cyan-500 text-xs font-bold text-white">
                  {{ getInitials(auth.user?.username || 'U') }}
                </div>
                <svg class="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <!-- Dropdown Menu -->
              <Transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="showUserMenu"
                  class="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-white/10 bg-slate-900/95 p-2 shadow-2xl backdrop-blur-xl"
                  @click.away="showUserMenu = false"
                >
                  <div class="border-b border-white/5 px-3 py-3 mb-2">
                    <div class="flex items-center gap-3">
                      <div v-if="auth.user?.avatarUrl" class="h-10 w-10 overflow-hidden rounded-lg ring-2 ring-white/10">
                        <img :src="auth.user.avatarUrl" :alt="auth.user.username" class="h-full w-full object-cover" referrerpolicy="no-referrer" />
                      </div>
                      <div v-else class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-cyan-500 text-sm font-bold text-white">
                        {{ getInitials(auth.user?.username || 'U') }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-white truncate">{{ auth.user?.username }}</p>
                        <p class="text-xs text-slate-400 truncate">{{ auth.user?.email }}</p>
                      </div>
                    </div>
                    <div class="mt-2 flex items-center gap-2">
                      <span 
                        class="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider"
                        :class="getRoleBadge(auth.user?.role || 'user').class"
                      >
                        {{ getRoleBadge(auth.user?.role || 'user').text }}
                      </span>
                      <span v-if="auth.user?.provider !== 'local'" class="inline-flex items-center gap-1 text-[10px] text-slate-500">
                        via {{ auth.user?.provider }}
                      </span>
                    </div>
                  </div>
                  <NuxtLink
                    to="/orders"
                    class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                    @click="showUserMenu = false"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    My Orders
                  </NuxtLink>
                  <button
                    @click="logout"
                    class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </Transition>
            </div>
            <NuxtLink
              v-else
              to="/login"
              class="ml-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:scale-105"
            >
              Sign in
            </NuxtLink>
          </template>
          <NuxtLink
            v-else
            to="/login"
            class="ml-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/25"
          >
            Sign in
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8">
      <slot />
    </main>

    <footer class="border-t border-white/5 bg-slate-900/50">
      <div class="mx-auto max-w-7xl px-4 py-8">
        <div class="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div class="flex items-center gap-3">
            <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-cyan-500">
              <IconGamepad class="h-4 w-4 text-white" />
            </div>
            <span class="text-sm text-slate-400">GameBoost · CS2 Services</span>
          </div>
          <p class="text-xs text-slate-500">
            Built with Nuxt 3, MongoDB, Tailwind CSS, Socket.IO · {{ currentYear }}
          </p>
        </div>
      </div>
    </footer>

    <!-- Socket.IO Status Indicator -->
    <SocketStatus />
  </div>
</template>
