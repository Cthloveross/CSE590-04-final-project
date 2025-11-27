<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useAsyncData } from 'nuxt/app'
import { useCatalogStore } from '~/stores/catalog'
import type { Game, Service } from '../../types/entities'

const route = useRoute()
const slug = route.params.slug as string
const catalog = useCatalogStore()
const typeFilter = ref('all')
const sort = ref<'asc' | 'desc'>('asc')

const { data: servicesData } = await useAsyncData<Service[]>(`game-${slug}-services`, async () => {
  if (!catalog.games.length) {
    await catalog.fetchGames()
  }
  await catalog.fetchServices(slug)
  return catalog.servicesByGame[slug] || []
})

const game = computed(() => catalog.games.find((g: Game) => g.slug === slug))
const services = computed(() => {
  let list: Service[] = servicesData.value || []
  if (typeFilter.value !== 'all') {
    list = list.filter((svc) => svc.type === typeFilter.value)
  }
  return [...list].sort((a, b) => (sort.value === 'asc' ? a.price - b.price : b.price - a.price))
})

const getStockStatus = (quantity: number) => {
  if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-400' }
  if (quantity <= 5) return { text: `Only ${quantity} left!`, color: 'text-yellow-400' }
  return { text: `${quantity} in stock`, color: 'text-emerald-400' }
}
</script>

<template>
  <section class="space-y-8">
    <header class="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm uppercase tracking-widest text-brand-light">{{ game?.name }}</p>
        <h1 class="text-3xl font-semibold text-white">Shop for {{ game?.name || slug }}</h1>
        <p class="text-sm text-slate-400">Browse available services and add them to your cart.</p>
      </div>
      <div class="flex flex-wrap gap-3 text-sm">
        <label class="flex items-center gap-2">
          Type
          <select v-model="typeFilter" class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2">
            <option value="all">All</option>
            <option value="boosting">Boosting</option>
            <option value="coaching">Coaching</option>
            <option value="placement">Placement</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label class="flex items-center gap-2">
          Sort
          <select v-model="sort" class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2">
            <option value="asc">Price: Low → High</option>
            <option value="desc">Price: High → Low</option>
          </select>
        </label>
      </div>
    </header>

    <div class="grid gap-6 md:grid-cols-2">
      <NuxtLink
        v-for="service in services"
        :key="service._id"
        :to="`/services/${service._id}`"
        class="card space-y-4 transition hover:border-brand/40"
      >
        <div class="flex items-center justify-between">
          <p class="text-xl font-semibold text-white">{{ service.title }}</p>
          <span class="rounded-full bg-brand/20 px-3 py-1 text-xs uppercase tracking-widest text-brand-light">{{ service.type }}</span>
        </div>
        <p class="text-sm text-slate-400">{{ service.description }}</p>
        <div class="flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-2xl font-semibold text-white">${{ service.price }}</span>
            <span class="text-xs text-slate-500">per service</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-sm font-medium" :class="getStockStatus(service.stockQuantity).color">
              {{ getStockStatus(service.stockQuantity).text }}
            </span>
            <span class="text-xs text-slate-400">View details →</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
