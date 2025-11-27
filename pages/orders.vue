<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAsyncData } from 'nuxt/app'
import type { Order } from '~/types/entities'

declare const definePageMeta: (meta: Record<string, any>) => void

definePageMeta({ middleware: 'auth' })

const orders = ref<Order[]>([])
const loading = ref(true)
const errorMessage = ref('')

const { refresh } = await useAsyncData('orders', async () => {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await $fetch<Order[]>('/api/orders')
    orders.value = response
    return response
  } catch (err: any) {
    errorMessage.value = err?.data?.message || err?.message || 'Unable to load orders'
    throw err
  } finally {
    loading.value = false
  }
})

const statusMeta: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-200' },
  in_progress: { label: 'In progress', color: 'bg-sky-500/20 text-sky-200' },
  completed: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-200' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-500/20 text-rose-200' },
}

const hasOrders = computed(() => orders.value.length > 0)
</script>

<template>
  <section class="space-y-8">
    <header class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <p class="text-sm uppercase tracking-widest text-brand-light">Orders</p>
      <h1 class="text-3xl font-semibold text-white">Track active + past boosts</h1>
      <p class="text-sm text-slate-400">
        View each order’s services, fulfillment window, and live status updates from our admin team.
      </p>
    </header>

    <div v-if="errorMessage" class="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
      {{ errorMessage }}
      <button class="ml-3 underline" @click="refresh">Retry</button>
    </div>

    <div v-if="loading" class="card text-center text-sm text-slate-400">Loading your orders…</div>
    <div v-else-if="!hasOrders" class="card text-center text-sm text-slate-400">
      No orders yet. Browse our <NuxtLink to="/" class="text-brand-light">services catalog</NuxtLink> to get started.
    </div>

    <div v-else class="space-y-4">
      <article
        v-for="order in orders"
        :key="order._id"
        class="card space-y-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs text-slate-400">Order placed {{ new Date(order.createdAt).toLocaleString() }}</p>
            <h2 class="text-2xl font-semibold text-white">${{ order.totalPrice }}</h2>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold uppercase"
            :class="statusMeta[order.status]?.color || 'bg-white/10 text-slate-200'"
          >
            {{ statusMeta[order.status]?.label || order.status }}
          </span>
        </div>

        <ul class="space-y-3 text-sm text-slate-300">
          <li
            v-for="item in order.items"
            :key="item.serviceId"
            class="flex items-start justify-between gap-4 rounded-lg border border-white/5 bg-slate-950/60 px-4 py-3"
          >
            <div>
              <p class="font-semibold text-white">{{ item.title }}</p>
              <p class="text-xs text-slate-400">{{ item.game.name }} · {{ item.type }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold text-white">${{ item.price }}</p>
              <p class="text-xs text-slate-400">Qty: {{ item.quantity }}</p>
            </div>
          </li>
        </ul>

        <div class="grid gap-4 text-sm text-slate-300 md:grid-cols-2">
          <div class="rounded-lg border border-white/5 bg-slate-950/50 p-4">
            <p class="text-xs uppercase tracking-widest text-slate-400">Game handle</p>
            <p class="text-lg font-semibold text-white">{{ order.instructions.gameHandle }}</p>
          </div>
          <div class="rounded-lg border border-white/5 bg-slate-950/50 p-4">
            <p class="text-xs uppercase tracking-widest text-slate-400">Region & window</p>
            <p class="text-lg font-semibold text-white">{{ order.instructions.region }} · {{ order.instructions.scheduleWindow }}</p>
          </div>
        </div>

        <p v-if="order.instructions.notes" class="rounded-lg border border-white/5 bg-slate-950/50 p-4 text-sm text-slate-300">
          <span class="font-semibold text-white">Buyer notes:</span> {{ order.instructions.notes }}
        </p>
      </article>
    </div>
  </section>
</template>
