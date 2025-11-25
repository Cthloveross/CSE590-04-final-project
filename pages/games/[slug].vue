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
  return [...list].sort((a, b) => (sort.value === 'asc' ? a.currentBid - b.currentBid : b.currentBid - a.currentBid))
})

const formatTimeRemaining = (endTime: string) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return 'Ended'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days}d ${hours}h left`
  return `${hours}h left`
}
</script>

<template>
  <section class="space-y-8">
    <header class="flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-900/60 p-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm uppercase tracking-widest text-brand-light">{{ game?.name }}</p>
        <h1 class="text-3xl font-semibold text-white">Auctions for {{ game?.name || slug }}</h1>
        <p class="text-sm text-slate-400">Browse active auctions. Place your bid to compete for premium services.</p>
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
            <option value="asc">Bid: Low → High</option>
            <option value="desc">Bid: High → Low</option>
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
            <span class="text-2xl font-semibold text-white">${{ service.currentBid }}</span>
            <span class="text-xs text-slate-500">{{ service.bidCount }} bid{{ service.bidCount === 1 ? '' : 's' }}</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-sm font-medium text-brand-light">{{ formatTimeRemaining(service.auctionEndTime) }}</span>
            <span class="text-xs text-slate-400">Tap to bid →</span>
          </div>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>
