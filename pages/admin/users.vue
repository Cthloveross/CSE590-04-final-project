<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAsyncData, useRequestFetch } from 'nuxt/app'
import type { UserRole, AuthProvider } from '~/types/entities'

declare const definePageMeta: (meta: Record<string, any>) => void

definePageMeta({ middleware: ['auth', 'admin'] })

// Use useRequestFetch to forward cookies during SSR
const requestFetch = useRequestFetch()

interface AdminUser {
  _id: string
  username: string
  email: string
  role: UserRole
  provider: AuthProvider
  avatarUrl?: string
  walletBalance: number
  createdAt: string
  updatedAt: string
}

const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const selectedRole = ref<'all' | UserRole>('all')
const searchQuery = ref('')

const roleOptions: { value: UserRole; label: string; color: string }[] = [
  { value: 'user', label: 'User (Buyer)', color: 'bg-slate-500/20 text-slate-200 border-slate-500/30' },
  { value: 'seller', label: 'Seller', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30' },
  { value: 'admin', label: 'Admin', color: 'bg-rose-500/20 text-rose-200 border-rose-500/30' },
]

const providerIcons: Record<AuthProvider, string> = {
  local: '📧',
  google: '🔵',
  github: '⚫',
}

const { data: users, status, refresh } = await useAsyncData('admin-users', async () => {
  try {
    return await requestFetch<AdminUser[]>('/api/admin/users')
  } catch (err: any) {
    message.value = err?.data?.message || err?.message || 'Unable to load users'
    messageType.value = 'error'
    throw err
  }
}, {
  default: () => [] as AdminUser[],
})

const loading = computed(() => status.value === 'pending')

const filteredUsers = computed(() => {
  let result = users.value ?? []
  
  // Filter by role
  if (selectedRole.value !== 'all') {
    result = result.filter((user) => user.role === selectedRole.value)
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    )
  }
  
  return result
})

const userStats = computed(() => {
  const usersList = users.value ?? []
  return {
    total: usersList.length,
    admins: usersList.filter((u) => u.role === 'admin').length,
    sellers: usersList.filter((u) => u.role === 'seller').length,
    buyers: usersList.filter((u) => u.role === 'user').length,
  }
})

const updateRole = async (user: AdminUser, newRole: UserRole) => {
  if (user.role === newRole) return
  
  const oldRole = user.role
  user.role = newRole // Optimistic update
  
  try {
    await $fetch(`/api/admin/users/${user._id}/role`, {
      method: 'PATCH',
      body: { role: newRole },
    })
    message.value = `Updated ${user.username}'s role to ${newRole}`
    messageType.value = 'success'
  } catch (err: any) {
    user.role = oldRole // Revert on error
    message.value = err?.data?.statusMessage || err?.message || 'Failed to update role'
    messageType.value = 'error'
  }
  
  // Clear message after 3 seconds
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const onRoleChange = (user: AdminUser, event: Event) => {
  const target = event.target as HTMLSelectElement
  const newRole = target.value as UserRole
  updateRole(user, newRole)
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getRoleBadgeClass = (role: UserRole) => {
  return roleOptions.find((r) => r.value === role)?.color || ''
}
</script>

<template>
  <section class="space-y-8">
    <!-- Header -->
    <header class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-orange-500">
          <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <div>
          <p class="text-sm uppercase tracking-widest text-brand-light">Admin Dashboard</p>
          <h1 class="text-3xl font-semibold text-white">User Management</h1>
        </div>
      </div>
      <p class="text-sm text-slate-400">
        View all registered users, manage roles, and monitor account activity.
      </p>
    </header>

    <!-- Stats Cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="card flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/20">
          <svg class="h-6 w-6 text-brand-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">{{ userStats.total }}</p>
          <p class="text-xs text-slate-400">Total Users</p>
        </div>
      </div>
      <div class="card flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/20">
          <svg class="h-6 w-6 text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">{{ userStats.admins }}</p>
          <p class="text-xs text-slate-400">Admins</p>
        </div>
      </div>
      <div class="card flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
          <svg class="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">{{ userStats.sellers }}</p>
          <p class="text-xs text-slate-400">Sellers</p>
        </div>
      </div>
      <div class="card flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-500/20">
          <svg class="h-6 w-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p class="text-2xl font-bold text-white">{{ userStats.buyers }}</p>
          <p class="text-xs text-slate-400">Buyers</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search users..."
            class="w-64 rounded-lg border border-white/10 bg-slate-950/80 py-2 pl-10 pr-4 text-sm placeholder-slate-500 focus:border-brand/50 focus:outline-none"
          />
        </div>
        <select
          v-model="selectedRole"
          class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
        >
          <option value="all">All Roles</option>
          <option v-for="option in roleOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
      <p class="text-sm text-slate-400">
        Showing {{ filteredUsers.length }} of {{ users.length }} users
      </p>
    </div>

    <!-- Message -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="message"
        class="rounded-lg border px-4 py-3 text-sm"
        :class="messageType === 'success' 
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' 
          : 'border-rose-500/30 bg-rose-500/10 text-rose-200'"
      >
        {{ message }}
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="loading" class="card text-center text-sm text-slate-400">
      Loading users...
    </div>

    <!-- Users Table -->
    <div v-else class="overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-white/10 bg-slate-950/50">
          <tr>
            <th class="px-4 py-3 font-medium text-slate-300">User</th>
            <th class="px-4 py-3 font-medium text-slate-300">Provider</th>
            <th class="px-4 py-3 font-medium text-slate-300">Role</th>
            <th class="px-4 py-3 font-medium text-slate-300">Wallet</th>
            <th class="px-4 py-3 font-medium text-slate-300">Joined</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          <tr
            v-for="user in filteredUsers"
            :key="user._id"
            class="hover:bg-white/5 transition-colors"
          >
            <td class="px-4 py-4">
              <div class="flex items-center gap-3">
                <div v-if="user.avatarUrl" class="h-10 w-10 overflow-hidden rounded-lg ring-2 ring-white/10">
                  <img :src="user.avatarUrl" :alt="user.username" class="h-full w-full object-cover" />
                </div>
                <div v-else class="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-cyan-500 text-xs font-bold text-white">
                  {{ getInitials(user.username) }}
                </div>
                <div>
                  <p class="font-medium text-white">{{ user.username }}</p>
                  <p class="text-xs text-slate-400">{{ user.email }}</p>
                </div>
              </div>
            </td>
            <td class="px-4 py-4">
              <span class="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-xs">
                <span>{{ providerIcons[user.provider] }}</span>
                <span class="capitalize">{{ user.provider }}</span>
              </span>
            </td>
            <td class="px-4 py-4">
              <select
                :value="user.role"
                @change="(e) => onRoleChange(user, e)"
                class="rounded-lg border px-2 py-1 text-xs font-medium uppercase cursor-pointer"
                :class="getRoleBadgeClass(user.role)"
              >
                <option v-for="option in roleOptions" :key="option.value" :value="option.value" class="bg-slate-900 text-white">
                  {{ option.value }}
                </option>
              </select>
            </td>
            <td class="px-4 py-4">
              <span class="text-brand-light font-semibold">${{ user.walletBalance.toFixed(2) }}</span>
            </td>
            <td class="px-4 py-4 text-slate-400">
              {{ formatDate(user.createdAt) }}
            </td>
          </tr>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-slate-400">
              No users found matching your criteria.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Role Legend -->
    <div class="card">
      <h3 class="mb-3 font-semibold text-white">Role Permissions</h3>
      <div class="grid gap-4 md:grid-cols-3">
        <div class="rounded-lg border border-slate-500/30 bg-slate-500/10 p-3">
          <p class="font-medium text-slate-200">User (Buyer)</p>
          <p class="mt-1 text-xs text-slate-400">Browse catalog, place bids, purchase services, view own orders</p>
        </div>
        <div class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
          <p class="font-medium text-emerald-200">Seller</p>
          <p class="mt-1 text-xs text-slate-400">All buyer permissions + create/manage own listings</p>
        </div>
        <div class="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
          <p class="font-medium text-rose-200">Admin</p>
          <p class="mt-1 text-xs text-slate-400">Full access: manage all users, listings, orders, and system settings</p>
        </div>
      </div>
    </div>
  </section>
</template>

