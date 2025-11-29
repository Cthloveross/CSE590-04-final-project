import { defineStore } from 'pinia'
import { useNuxtApp, useRequestFetch } from 'nuxt/app'
import type { $Fetch, FetchOptions } from 'ofetch'
import { $fetch as ofetch } from 'ofetch'
import { reactive, ref } from 'vue'
import type { Game, Service } from '~/types/entities'

export const useCatalogStore = defineStore('catalog', () => {
  const nuxtApp = useNuxtApp()
  const requestFetch = useRequestFetch()
  const fetcher = (requestFetch ?? nuxtApp.$fetch ?? ofetch) as $Fetch
  const games = ref<Game[]>([])
  const servicesByGame = reactive<Record<string, Service[]>>({})
  const loading = ref(false)

  const apiFetch = async <T>(url: string, options?: FetchOptions<'json'>) =>
    fetcher<T>(url, options)

  const fetchGames = async () => {
    loading.value = true
    try {
      games.value = await apiFetch<Game[]>('/api/games')
    } finally {
      loading.value = false
    }
  }

  const fetchServices = async (slug: string) => {
    loading.value = true
    try {
      servicesByGame[slug] = await apiFetch<Service[]>(`/api/games/${slug}/services`)
    } finally {
      loading.value = false
    }
  }

  // Update service stock in real-time (called from socket listener)
  const updateServiceStock = (serviceId: string, newStock: number) => {
    // Update in all game service lists
    for (const slug in servicesByGame) {
      const services = servicesByGame[slug]
      const service = services.find(s => s._id === serviceId)
      if (service) {
        console.log(`📊 Real-time stock update: ${service.title} -> ${newStock}`)
        service.stockQuantity = newStock
        break
      }
    }
  }

  return {
    games,
    servicesByGame,
    loading,
    fetchGames,
    fetchServices,
    updateServiceStock,
  }
})
