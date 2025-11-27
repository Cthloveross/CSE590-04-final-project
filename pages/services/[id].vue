<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useAsyncData, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import type { Service } from '~/types/entities'

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()
const quantity = ref(1)
const notes = ref('')
const addingToCart = ref(false)

const { data: service } = await useAsyncData<Service>(`service-${route.params.id}`, () =>
  $fetch(`/api/services/${route.params.id}`)
)

const stockStatus = computed(() => {
  if (!service.value) return { text: '', color: '' }
  const qty = service.value.stockQuantity
  if (qty === 0) return { text: 'Out of Stock', color: 'text-red-400' }
  if (qty <= 5) return { text: `Only ${qty} left!`, color: 'text-yellow-400' }
  return { text: `${qty} in stock`, color: 'text-emerald-400' }
})

const totalPrice = computed(() => {
  if (!service.value) return 0
  return service.value.price * quantity.value
})

const maxQuantity = computed(() => {
  if (!service.value) return 1
  return Math.min(service.value.stockQuantity, 25)
})

const addToCart = async () => {
  if (!service.value) return
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }
  
  if (service.value.stockQuantity < quantity.value) {
    alert('Not enough stock available')
    return
  }
  
  addingToCart.value = true
  try {
    await cart.addItem({ serviceId: service.value._id, quantity: quantity.value, notes: notes.value })
    await navigateTo('/cart')
  } finally {
    addingToCart.value = false
  }
}
</script>

<template>
  <section v-if="service" class="space-y-8">
    <header class="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <p class="text-sm uppercase tracking-widest text-brand-light">{{ service.game?.name }} Service</p>
      <h1 class="text-3xl font-semibold text-white">{{ service.title }}</h1>
      <p class="text-sm text-slate-400">{{ service.description }}</p>
    </header>

    <div class="grid gap-8 md:grid-cols-3">
      <div class="card md:col-span-2 space-y-4">
        <h2 class="text-lg font-semibold text-white">Service Details</h2>
        <ul class="space-y-3 text-sm text-slate-300">
          <li>Type: <span class="text-white capitalize">{{ service.type }}</span></li>
          <li>Price: <span class="text-2xl font-bold text-brand-light">${{ service.price }}</span></li>
          <li>
            Availability: 
            <span class="font-semibold" :class="stockStatus.color">
              {{ stockStatus.text }}
            </span>
          </li>
          <li v-if="service.game">Game: <span class="text-white">{{ service.game.name }}</span></li>
        </ul>
        
        <div v-if="service.stockQuantity === 0" class="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p class="text-red-400 font-semibold">⚠️ Currently Out of Stock</p>
          <p class="text-sm text-slate-400 mt-2">Check back later for availability.</p>
        </div>
      </div>
      
      <div class="space-y-4">
        <div class="card space-y-4">
          <h2 class="text-lg font-semibold text-white">Add to Cart</h2>
          
          <div class="space-y-3 text-sm text-slate-300">
            <label class="flex flex-col gap-1">
              Quantity
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                :max="maxQuantity"
                :disabled="service.stockQuantity === 0"
                class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <p class="text-xs text-slate-500">Max: {{ maxQuantity }}</p>
            </label>
            
            <label class="flex flex-col gap-1">
              Buyer notes (optional)
              <textarea
                v-model="notes"
                rows="3"
                :disabled="service.stockQuantity === 0"
                class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Preferred schedule, platform, account details, etc."
              />
            </label>
          </div>
          
          <div class="rounded-lg bg-slate-950/80 border border-white/10 p-4">
            <div class="flex justify-between text-sm">
              <span class="text-slate-400">Price per unit:</span>
              <span class="text-white">${{ service.price }}</span>
            </div>
            <div class="flex justify-between text-sm mt-1">
              <span class="text-slate-400">Quantity:</span>
              <span class="text-white">{{ quantity }}</span>
            </div>
            <div class="border-t border-white/10 mt-2 pt-2 flex justify-between">
              <span class="font-semibold text-white">Total:</span>
              <span class="text-xl font-bold text-brand-light">${{ totalPrice.toFixed(2) }}</span>
            </div>
          </div>
          
          <button 
            class="btn-primary w-full" 
            :disabled="service.stockQuantity === 0 || addingToCart || quantity > service.stockQuantity"
            @click="addToCart"
          >
            {{ addingToCart ? 'Adding...' : service.stockQuantity === 0 ? 'Out of Stock' : `Add to Cart • $${totalPrice.toFixed(2)}` }}
          </button>
          
          <p v-if="!auth.isAuthenticated" class="text-xs text-center text-slate-400">
            You must be logged in to add items to cart
          </p>
          <p v-else class="text-xs text-center text-slate-400">
            Secure checkout with your account balance
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
