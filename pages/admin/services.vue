<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useAsyncData, useNuxtApp } from 'nuxt/app'
import type { Service, Game } from '~/types/entities'
import { useCatalogStore } from '~/stores/catalog'

declare const definePageMeta: (meta: Record<string, any>) => void
declare const confirm: (message?: string) => boolean

// Allow both sellers and admins to manage services
definePageMeta({ middleware: ['auth', 'seller'] })

const nuxtApp = useNuxtApp()
const fetcher = nuxtApp.$fetch as typeof $fetch
const services = ref<Service[]>([])
const loading = ref(true)
const message = ref('')
const catalog = useCatalogStore()
const editing = ref<Service | null>(null)
const saving = ref(false)

const form = reactive({
  gameId: '',
  title: '',
  price: 50,
  type: 'boosting',
  description: '',
  imageUrl: '',
  isActive: true,
})

const statusFilters = ['all', 'active', 'inactive'] as const
const selectedFilter = ref<(typeof statusFilters)[number]>('all')

const filteredServices = computed(() => {
  if (selectedFilter.value === 'all') return services.value
  const active = selectedFilter.value === 'active'
  return services.value.filter((svc) => svc.isActive === active)
})

const resetForm = () => {
  editing.value = null
  form.gameId = catalog.games[0]?._id || ''
  form.title = ''
  form.price = 50
  form.type = 'boosting'
  form.description = ''
  form.imageUrl = ''
  form.isActive = true
}

const startEdit = (svc: Service) => {
  editing.value = svc
  form.gameId = svc.gameId
  form.title = svc.title
  form.price = svc.price
  form.type = svc.type
  form.description = svc.description
  form.imageUrl = svc.imageUrl || ''
  form.isActive = svc.isActive
}

const submit = async () => {
  saving.value = true
  message.value = ''
  try {
    const payload = { ...form, price: Number(form.price) }
    if (editing.value) {
      await fetcher(`/api/services/${editing.value._id}`, { method: 'PUT', body: payload })
    } else {
      await fetcher('/api/services', { method: 'POST', body: payload })
    }
    await refresh()
    resetForm()
    message.value = 'Service saved successfully'
  } catch (err: any) {
    message.value = err?.data?.message || err?.message || 'Unable to save service'
  } finally {
    saving.value = false
  }
}

const removeService = async (id: string) => {
  if (!confirm('Delete this service?')) return
  try {
    await fetcher(`/api/services/${id}`, { method: 'DELETE' })
    await refresh()
  } catch (err: any) {
    message.value = err?.data?.message || err?.message || 'Unable to delete service'
  }
}

const { refresh } = await useAsyncData('admin-services', async () => {
  loading.value = true
  try {
    const [servicesResponse] = await Promise.all([
      fetcher<Service[]>('/api/services'),
      catalog.games.length ? Promise.resolve() : catalog.fetchGames(),
    ])
    services.value = servicesResponse
    if (!form.gameId && catalog.games.length) {
      form.gameId = catalog.games[0]._id
    }
    return servicesResponse
  } finally {
    loading.value = false
  }
})

const games = computed<Game[]>(() => catalog.games)
</script>

<template>
  <section class="space-y-8">
    <header class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-cyan-500">
          <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div>
          <p class="text-sm uppercase tracking-widest text-brand-light">Admin Dashboard</p>
          <h1 class="text-3xl font-semibold text-white">Service Management</h1>
        </div>
      </div>
      <p class="text-sm text-slate-400">
        Edit the offerings available to buyers, control pricing, and toggle availability per title.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-3">
      <form class="space-y-4 lg:col-span-1" @submit.prevent="submit">
        <div class="card space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-lg font-semibold text-white">{{ editing ? 'Edit service' : 'Create service' }}</p>
            <button v-if="editing" type="button" class="text-xs text-slate-400 hover:text-white" @click="resetForm">Clear</button>
          </div>
          <label class="text-sm text-slate-300">
            Game
            <select v-model="form.gameId" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2">
              <option v-for="game in games" :key="game._id" :value="game._id">
                {{ game.name }}
              </option>
            </select>
          </label>
          <label class="text-sm text-slate-300">
            Title
            <input v-model="form.title" type="text" required minlength="3" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
          </label>
          <label class="text-sm text-slate-300">
            Price (USD)
            <input v-model.number="form.price" type="number" min="5" step="5" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
          </label>
          <label class="text-sm text-slate-300">
            Type
            <select v-model="form.type" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2">
              <option value="boosting">Boosting</option>
              <option value="coaching">Coaching</option>
              <option value="placement">Placement</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label class="text-sm text-slate-300">
            Description
            <textarea v-model="form.description" rows="4" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
          </label>
          <label class="text-sm text-slate-300">
            Image URL
            <input v-model="form.imageUrl" type="url" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" placeholder="https://" />
          </label>
          <label class="flex items-center gap-2 text-sm text-slate-300">
            <input v-model="form.isActive" type="checkbox" class="rounded border-white/20 bg-slate-950/80 text-brand" />
            Active
          </label>
        </div>
        <button type="submit" class="btn-primary w-full disabled:opacity-40" :disabled="saving">
          {{ saving ? 'Saving...' : editing ? 'Update service' : 'Create service' }}
        </button>
        <p v-if="message" class="text-sm text-emerald-300">{{ message }}</p>
      </form>

      <div class="space-y-4 lg:col-span-2">
        <div class="flex items-center justify-between">
          <p class="text-sm text-slate-400">{{ services.length }} total services</p>
          <div class="flex items-center gap-2 text-sm">
            <span>Filter</span>
            <select v-model="selectedFilter" class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2">
              <option v-for="filter in statusFilters" :key="filter" :value="filter">
                {{ filter }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="loading" class="card text-sm text-slate-400">Loading services...</div>
        <div v-else class="space-y-3">
          <article
            v-for="service in filteredServices"
            :key="service._id"
            class="card space-y-3"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-xs uppercase tracking-widest text-brand-light">{{ service.game?.name }}</p>
                <h2 class="text-xl font-semibold text-white">{{ service.title }}</h2>
                <p class="text-sm text-slate-400">{{ service.description }}</p>
              </div>
              <span class="text-2xl font-semibold text-white">${{ service.price }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span class="rounded-full border border-white/10 px-3 py-1 uppercase">{{ service.type }}</span>
              <span class="rounded-full px-3 py-1" :class="service.isActive ? 'bg-emerald-500/20 text-emerald-200' : 'bg-slate-700/60 text-slate-200'">
                {{ service.isActive ? 'Active' : 'Paused' }}
              </span>
            </div>
            <div class="flex flex-wrap gap-3">
              <button class="rounded-md border border-white/20 px-3 py-1 text-sm hover:border-brand" @click="startEdit(service)">
                Edit
              </button>
              <button class="rounded-md border border-rose-400/40 px-3 py-1 text-sm text-rose-200" @click="removeService(service._id)">
                Delete
              </button>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>
