<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useAsyncData, navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'
import type { Service } from '~/types/entities'

const route = useRoute()
const auth = useAuthStore()
const cart = useCartStore()
const bidAmount = ref<number | null>(null)
const bidError = ref('')
const bidSuccess = ref(false)
const quantity = ref(1)
const notes = ref('')

const { data: service, refresh } = await useAsyncData<Service>(`service-${route.params.id}`, () =>
  $fetch(`/api/services/${route.params.id}`)
)

const timeRemaining = computed(() => {
  if (!service.value) return ''
  const now = new Date()
  const end = new Date(service.value.auctionEndTime)
  const diff = end.getTime() - now.getTime()
  
  if (diff <= 0) return 'Auction Ended'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''}`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`
  return `${minutes} minute${minutes > 1 ? 's' : ''}`
})

const auctionEnded = computed(() => {
  if (!service.value) return false
  return new Date(service.value.auctionEndTime) <= new Date()
})

const minBid = computed(() => {
  if (!service.value) return 0
  return service.value.currentBid + 1
})

const instantPrice = computed(() => {
  if (!service.value) return 0
  return service.value.price ?? service.value.currentBid
})

const placeBid = async () => {
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }
  
  bidError.value = ''
  bidSuccess.value = false
  
  if (!bidAmount.value || bidAmount.value < minBid.value) {
    bidError.value = `Bid must be at least $${minBid.value}`
    return
  }
  
  try {
    const response = await $fetch(`/api/services/${service.value!._id}/bid`, {
      method: 'POST',
      body: { bidAmount: bidAmount.value }
    })
    
    bidSuccess.value = true
    bidAmount.value = null
    await refresh()
    
    setTimeout(() => {
      bidSuccess.value = false
    }, 3000)
  } catch (error: any) {
    bidError.value = error?.data?.message || 'Failed to place bid'
  }
}

const addToCart = async () => {
  if (!service.value) return
  if (!auth.isAuthenticated) {
    await navigateTo('/login')
    return
  }
  await cart.addItem({ serviceId: service.value._id, quantity: quantity.value, notes: notes.value })
  await navigateTo('/cart')
}
</script>

<template>
  <section v-if="service" class="space-y-8">
    <header class="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <p class="text-sm uppercase tracking-widest text-brand-light">{{ service.game?.name }} Auction</p>
      <h1 class="text-3xl font-semibold text-white">{{ service.title }}</h1>
      <p class="text-sm text-slate-400">{{ service.description }}</p>
    </header>

    <div class="grid gap-8 md:grid-cols-3">
      <div class="card md:col-span-2 space-y-4">
        <h2 class="text-lg font-semibold text-white">Auction Details</h2>
        <ul class="space-y-3 text-sm text-slate-300">
          <li>Type: <span class="text-white capitalize">{{ service.type }}</span></li>
          <li>Starting Price: <span class="text-white">${{ service.startingPrice }}</span></li>
          <li>Current Bid: <span class="text-2xl font-bold text-brand-light">${{ service.currentBid }}</span></li>
          <li>Total Bids: <span class="text-white">{{ service.bidCount }}</span></li>
          <li>Time Remaining: <span :class="auctionEnded ? 'text-red-400' : 'text-white'">{{ timeRemaining }}</span></li>
          <li v-if="service.highestBidder && auth.user?._id === service.highestBidder" class="text-brand-light font-semibold">
            🏆 You are the highest bidder!
          </li>
        </ul>
      </div>
      <div class="space-y-4">
        <div class="card space-y-4">
          <h2 class="text-lg font-semibold text-white">Place Your Bid</h2>
          
          <div v-if="auctionEnded" class="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-center">
            <p class="text-red-400 font-semibold">Auction Has Ended</p>
          </div>
          
          <template v-else>
            <div class="space-y-2">
              <label class="text-sm text-slate-300">
                Your Bid Amount
                <div class="relative mt-1">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input
                    v-model.number="bidAmount"
                    type="number"
                    :min="minBid"
                    step="1"
                    placeholder="Enter bid amount"
                    class="w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2 pl-6"
                  />
                </div>
                <p class="text-xs text-slate-500 mt-1">Minimum bid: ${{ minBid }}</p>
              </label>
            </div>
            
            <div v-if="bidError" class="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {{ bidError }}
            </div>
            
            <div v-if="bidSuccess" class="rounded-lg bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
              ✓ Bid placed successfully!
            </div>
            
            <button 
              class="btn-primary w-full" 
              :disabled="!bidAmount || bidAmount < minBid"
              @click="placeBid"
            >
              Place Bid {{ bidAmount ? `• $${bidAmount}` : '' }}
            </button>
            
            <p v-if="!auth.isAuthenticated" class="text-xs text-center text-slate-400">
              You must be logged in to place a bid
            </p>
          </template>
        </div>

        <div class="card space-y-4">
          <h2 class="text-lg font-semibold text-white">Buy it now</h2>
          <p class="text-sm text-slate-400">
            Prefer to skip the auction? Add this service to your cart instantly for ${{ instantPrice }}.
          </p>
          <div class="space-y-3 text-sm text-slate-300">
            <label class="flex flex-col gap-1">
              Quantity
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                max="25"
                class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
              />
            </label>
            <label class="flex flex-col gap-1">
              Buyer notes
              <textarea
                v-model="notes"
                rows="3"
                class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                placeholder="Preferred schedule, platform, etc."
              />
            </label>
          </div>
          <button class="btn-primary w-full" @click="addToCart">
            Add to cart • ${{ (instantPrice * quantity).toFixed(2) }}
          </button>
          <p class="text-xs text-center text-slate-400">
            Cart checkout captures region, schedule, and credentials securely.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
