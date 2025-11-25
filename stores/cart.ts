import { defineStore } from 'pinia'
import { useNuxtApp, useRequestFetch } from 'nuxt/app'
import type { $Fetch, FetchOptions } from 'ofetch'
import { $fetch as ofetch } from 'ofetch'
import { computed, ref } from 'vue'
import type { CartItem } from '~/types/entities'

interface CartPayload {
  serviceId: string
  quantity: number
  notes?: string
}

export const useCartStore = defineStore(
  'cart',
  () => {
    const nuxtApp = useNuxtApp()
    const requestFetch = useRequestFetch()
    const fetcher = (requestFetch ?? nuxtApp.$fetch ?? ofetch) as $Fetch
    const items = ref<CartItem[]>([])
    const loading = ref(false)

    const apiFetch = async <T>(url: string, options?: FetchOptions<'json'>) =>
      fetcher<T>(url, options)

    const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.quantity * (item.service?.price ?? 0), 0))

    const load = async () => {
      loading.value = true
      try {
        const response = await apiFetch<CartItem[]>('/api/cart')
        items.value = response
      } finally {
        loading.value = false
      }
    }

    const addItem = async (payload: CartPayload) => {
      await apiFetch<CartItem[]>('/api/cart', { method: 'POST', body: payload })
      await load()
    }

    const updateItem = async (itemId: string, payload: Partial<CartPayload>) => {
      await apiFetch(`/api/cart/${itemId}`, { method: 'PATCH', body: payload })
      await load()
    }

    const removeItem = async (itemId: string) => {
      await apiFetch(`/api/cart/${itemId}`, { method: 'DELETE' })
      items.value = items.value.filter((item) => item._id !== itemId)
    }

    const clear = () => {
      items.value = []
    }

    return {
      items,
      loading,
      subtotal,
      load,
      addItem,
      updateItem,
      removeItem,
      clear,
    }
  },
  {
    persist: {
      pick: ['items'],
    },
  }
)
