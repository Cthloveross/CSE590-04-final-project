<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAsyncData, useRequestFetch } from 'nuxt/app'
import type { Service, Game } from '~/types/entities'
import { useCatalogStore } from '~/stores/catalog'

declare const definePageMeta: (meta: Record<string, any>) => void

// Allow both sellers and admins to manage services
definePageMeta({ middleware: ['auth', 'seller'] })

// Use useRequestFetch to forward cookies during SSR
const requestFetch = useRequestFetch()

const message = ref('')
const messageType = ref<'success' | 'error'>('success')
const catalog = useCatalogStore()

// Selected service for providing stock
const selectedService = ref<Service | null>(null)
const showProvideModal = ref(false)

// Provider form
const providerForm = ref({
  quantity: 1,
  notes: '',
  timeSlots: [] as string[],
})

// Available time slots for demo
const availableTimeSlots = [
  'Morning (6AM - 12PM)',
  'Afternoon (12PM - 6PM)',
  'Evening (6PM - 12AM)',
  'Night (12AM - 6AM)',
  'Weekdays Only',
  'Weekends Only',
  'Flexible / Any Time',
]

// Game filter
const selectedGameFilter = ref<string>('all')
const selectedTypeFilter = ref<string>('all')
const searchQuery = ref('')

const filteredServices = computed(() => {
  let result = (services.value ?? []).filter(s => s.isActive)

  if (selectedGameFilter.value !== 'all') {
    result = result.filter(s => s.gameId === selectedGameFilter.value)
  }

  if (selectedTypeFilter.value !== 'all') {
    result = result.filter(s => s.type === selectedTypeFilter.value)
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(s =>
      s.title.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
    )
  }

  return result
})

const serviceTypes = ['boosting', 'coaching', 'placement', 'companion', 'custom']

const typeColors: Record<string, string> = {
  boosting: 'bg-purple-500/20 text-purple-200 border-purple-500/30',
  coaching: 'bg-amber-500/20 text-amber-200 border-amber-500/30',
  placement: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30',
  companion: 'bg-sky-500/20 text-sky-200 border-sky-500/30',
  custom: 'bg-rose-500/20 text-rose-200 border-rose-500/30',
}

const openProvideModal = (service: Service) => {
  selectedService.value = service
  providerForm.value = {
    quantity: 1,
    notes: '',
    timeSlots: [],
  }
  showProvideModal.value = true
}

const closeModal = () => {
  showProvideModal.value = false
  selectedService.value = null
}

const toggleTimeSlot = (slot: string) => {
  const idx = providerForm.value.timeSlots.indexOf(slot)
  if (idx >= 0) {
    providerForm.value.timeSlots.splice(idx, 1)
  } else {
    providerForm.value.timeSlots.push(slot)
  }
}

const submitProvide = async () => {
  if (!selectedService.value) return

  try {
    // Add stock to the service
    await $fetch(`/api/services/${selectedService.value._id}/add-stock`, {
      method: 'POST',
      body: {
        quantity: providerForm.value.quantity,
        notes: providerForm.value.notes,
        timeSlots: providerForm.value.timeSlots,
      },
    })

    message.value = `Successfully added ${providerForm.value.quantity} slot(s) to "${selectedService.value.title}"`
    messageType.value = 'success'
    await refresh()
    closeModal()
  } catch (err: any) {
    message.value = err?.data?.message || err?.message || 'Failed to add stock'
    messageType.value = 'error'
  }

  // Clear message after 4 seconds
  setTimeout(() => { message.value = '' }, 4000)
}

const { data: services, status, refresh } = await useAsyncData('seller-services', async () => {
  await Promise.all([
    Promise.resolve(), // placeholder to keep the Promise.all pattern
    catalog.games.length ? Promise.resolve() : catalog.fetchGames(),
  ])
  return await requestFetch<Service[]>('/api/services')
}, {
  default: () => [] as Service[],
})

const loading = computed(() => status.value === 'pending')

const games = computed<Game[]>(() => catalog.games)
</script>

<template>
  <section class="space-y-8">
    <!-- Header -->
    <header class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <div class="flex items-center gap-3">
        <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500">
          <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-sm uppercase tracking-widest text-emerald-400">Seller Dashboard</p>
          <h1 class="text-3xl font-semibold text-white">Provide Services</h1>
        </div>
      </div>
      <p class="text-sm text-slate-400">
        Select a service template below and add your availability. When buyers purchase, you'll be matched to fulfill the order.
      </p>
    </header>

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

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="relative flex-1 min-w-[200px]">
        <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search services..."
          class="w-full rounded-lg border border-white/10 bg-slate-950/80 py-2 pl-10 pr-4 text-sm placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
        />
      </div>

      <select
        v-model="selectedGameFilter"
        class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
      >
        <option value="all">All Games</option>
        <option v-for="game in games" :key="game._id" :value="game._id">
          {{ game.name }}
        </option>
      </select>

      <select
        v-model="selectedTypeFilter"
        class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 text-sm"
      >
        <option value="all">All Types</option>
        <option v-for="type in serviceTypes" :key="type" :value="type" class="capitalize">
          {{ type }}
        </option>
      </select>
    </div>

    <!-- Service count -->
    <p class="text-sm text-slate-400">{{ filteredServices.length }} services available</p>

    <!-- Loading -->
    <div v-if="loading" class="card text-center text-sm text-slate-400">
      Loading services...
    </div>

    <!-- Services Grid -->
    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article
        v-for="service in filteredServices"
        :key="service._id"
        class="group card relative overflow-hidden transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
      >
        <!-- Game badge -->
        <div class="absolute right-3 top-3">
          <span class="rounded-full bg-white/5 px-2 py-1 text-xs text-slate-400">
            {{ service.game?.name || 'Unknown' }}
          </span>
        </div>

        <!-- Content -->
        <div class="space-y-3">
          <div>
            <span
              class="mb-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium uppercase"
              :class="typeColors[service.type]"
            >
              {{ service.type }}
            </span>
            <h3 class="text-lg font-semibold text-white">{{ service.title }}</h3>
            <p class="mt-1 text-sm text-slate-400 line-clamp-2">{{ service.description }}</p>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <span class="text-2xl font-bold text-white">${{ service.price }}</span>
              <span class="text-xs text-slate-500"> / service</span>
            </div>
            <div class="text-right text-xs text-slate-400">
              <span class="text-emerald-400 font-semibold">{{ service.stockQuantity }}</span> in stock
            </div>
          </div>

          <button
            @click="openProvideModal(service)"
            class="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:from-emerald-500 hover:to-cyan-500 hover:shadow-lg hover:shadow-emerald-500/20"
          >
            <span class="flex items-center justify-center gap-2">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Provide This Service
            </span>
          </button>
        </div>
      </article>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && filteredServices.length === 0" class="card text-center py-12">
      <div class="text-4xl mb-4">🔍</div>
      <p class="text-slate-400">No services match your filters</p>
      <button
        @click="selectedGameFilter = 'all'; selectedTypeFilter = 'all'; searchQuery = ''"
        class="mt-4 text-sm text-emerald-400 hover:text-emerald-300"
      >
        Clear filters
      </button>
    </div>

    <!-- Provide Service Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showProvideModal"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          @click.self="closeModal"
        >
          <Transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95"
          >
            <div
              v-if="showProvideModal && selectedService"
              class="w-full max-w-lg rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
            >
              <!-- Modal Header -->
              <div class="mb-6">
                <div class="flex items-start justify-between">
                  <div>
                    <span
                      class="mb-2 inline-block rounded-full border px-2 py-0.5 text-xs font-medium uppercase"
                      :class="typeColors[selectedService.type]"
                    >
                      {{ selectedService.type }}
                    </span>
                    <h2 class="text-xl font-semibold text-white">{{ selectedService.title }}</h2>
                    <p class="text-sm text-slate-400">{{ selectedService.game?.name || 'Unknown' }}</p>
                  </div>
                  <button @click="closeModal" class="text-slate-400 hover:text-white">
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p class="mt-2 text-sm text-slate-400">{{ selectedService.description }}</p>
                <div class="mt-3 flex items-center gap-4 text-sm">
                  <span class="text-white font-semibold">${{ selectedService.price }}</span>
                  <span class="text-slate-500">|</span>
                  <span class="text-emerald-400">{{ selectedService.stockQuantity }} currently in stock</span>
                </div>
              </div>

              <!-- Form -->
              <div class="space-y-5">
                <!-- Quantity -->
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    How many can you provide?
                  </label>
                  <div class="flex items-center gap-3">
                    <button
                      @click="providerForm.quantity = Math.max(1, providerForm.quantity - 1)"
                      class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-950 text-white hover:bg-slate-800"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>
                    <input
                      v-model.number="providerForm.quantity"
                      type="number"
                      min="1"
                      max="100"
                      class="w-20 rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-center text-lg font-semibold text-white"
                    />
                    <button
                      @click="providerForm.quantity = Math.min(100, providerForm.quantity + 1)"
                      class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-slate-950 text-white hover:bg-slate-800"
                    >
                      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Time Slots -->
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Your availability (select all that apply)
                  </label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="slot in availableTimeSlots"
                      :key="slot"
                      @click="toggleTimeSlot(slot)"
                      class="rounded-full px-3 py-1.5 text-xs font-medium transition-all"
                      :class="providerForm.timeSlots.includes(slot)
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/50'
                        : 'bg-slate-800 text-slate-400 border border-white/10 hover:border-white/20'"
                    >
                      {{ slot }}
                    </button>
                  </div>
                </div>

                <!-- Notes -->
                <div>
                  <label class="block text-sm font-medium text-slate-300 mb-2">
                    Additional notes for buyers (optional)
                  </label>
                  <textarea
                    v-model="providerForm.notes"
                    rows="3"
                    placeholder="E.g., 'I specialize in Diamond+ lobbies' or 'Available for voice chat coaching'"
                    class="w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>

                <!-- Submit -->
                <div class="flex gap-3 pt-2">
                  <button
                    @click="closeModal"
                    class="flex-1 rounded-lg border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    @click="submitProvide"
                    class="flex-1 rounded-lg bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:from-emerald-500 hover:to-cyan-500"
                  >
                    Add {{ providerForm.quantity }} Slot{{ providerForm.quantity > 1 ? 's' : '' }}
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>
