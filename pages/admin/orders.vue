<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAsyncData, useRequestFetch } from 'nuxt/app'
import type { Order, OrderStatus } from '~/types/entities'

declare const definePageMeta: (meta: Record<string, any>) => void

definePageMeta({ middleware: ['auth', 'admin'] })

const message = ref('')
const selectedStatus = ref<'all' | OrderStatus>('all')

// Use useRequestFetch to forward cookies during SSR
const requestFetch = useRequestFetch()

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const statusBadge: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-100',
  in_progress: 'bg-sky-500/20 text-sky-100',
  completed: 'bg-emerald-500/20 text-emerald-100',
  cancelled: 'bg-rose-500/20 text-rose-100',
}

const { data: orders, status, refresh } = await useAsyncData('admin-orders', async () => {
  try {
    return await requestFetch<Order[]>('/api/admin/orders')
  } catch (err: any) {
    message.value = err?.data?.message || err?.message || 'Unable to load orders'
    throw err
  }
}, {
  default: () => [] as Order[],
})

const loading = computed(() => status.value === 'pending')

const filteredOrders = computed(() => {
  const ordersList = orders.value ?? []
  if (selectedStatus.value === 'all') return ordersList
  return ordersList.filter((order) => order.status === selectedStatus.value)
})

const updateStatus = async (order: Order, status: OrderStatus) => {
  if (order.status === status) return
  order.status = status
  try {
    await $fetch(`/api/admin/orders/${order._id}/status`, {
      method: 'PATCH',
      body: { status },
    })
    message.value = 'Order status updated'
  } catch (err: any) {
    message.value = err?.data?.message || err?.message || 'Failed to update order'
    await refresh()
  }
}

const onStatusChange = (order: Order, event: Event) => {
  const target = event.target as { value?: string } | null
  const nextStatus = target?.value as OrderStatus | undefined
  if (nextStatus) {
    updateStatus(order, nextStatus)
  }
}
</script>

<template>
  <section class="space-y-8">
    <header class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
          <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div>
          <p class="text-sm uppercase tracking-widest text-brand-light">Admin Dashboard</p>
          <h1 class="text-3xl font-semibold text-white">Order Management</h1>
        </div>
      </div>
      <p class="text-sm text-slate-400">
        Track every purchase, review buyer instructions, and advance orders as boosters progress.
      </p>
    </header>

    <div class="flex flex-wrap items-center justify-between gap-4">
      <p class="text-sm text-slate-400">{{ orders.length }} total orders</p>
      <div class="flex items-center gap-2 text-sm">
        <span>Status filter</span>
        <select v-model="selectedStatus" class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2">
          <option value="all">All</option>
          <option v-for="option in statusOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="message" class="rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-sm text-slate-200">
      {{ message }}
    </div>

    <div v-if="loading" class="card text-center text-sm text-slate-400">Loading orders…</div>

    <div v-else class="space-y-4">
      <article v-for="order in filteredOrders" :key="order._id" class="card space-y-4">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs text-slate-400">Buyer: {{ order.user?.email || order.userId }}</p>
            <h2 class="text-2xl font-semibold text-white">${{ order.totalPrice }}</h2>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-semibold uppercase" :class="statusBadge[order.status]">
            {{ order.status.replace('_', ' ') }}
          </span>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <div class="space-y-3 rounded-lg border border-white/10 bg-slate-950/60 p-4">
            <p class="text-xs uppercase tracking-widest text-slate-500">Instructions</p>
            <p class="text-sm text-slate-300">Handle: {{ order.instructions.gameHandle }}</p>
            <p class="text-sm text-slate-300">Region: {{ order.instructions.region }}</p>
            <p class="text-sm text-slate-300">Window: {{ order.instructions.scheduleWindow }}</p>
            <p v-if="order.instructions.notes" class="text-sm text-slate-300">Notes: {{ order.instructions.notes }}</p>
          </div>
          <div class="space-y-3 rounded-lg border border-white/10 bg-slate-950/60 p-4">
            <p class="text-xs uppercase tracking-widest text-slate-500">Update status</p>
            <select
              class="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
              :value="order.status"
              @change="(event) => onStatusChange(order, event)"
            >
              <option v-for="option in statusOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
            <ul class="divide-y divide-white/5 text-sm text-slate-300">
              <li v-for="item in order.items" :key="item.serviceId" class="flex items-center justify-between py-2">
                <span>{{ item.title }} ({{ item.quantity }}×)</span>
                <span class="text-white">${{ item.price * item.quantity }}</span>
              </li>
            </ul>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
