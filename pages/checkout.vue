<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useAsyncData, useNuxtApp, navigateTo } from 'nuxt/app'
import { useCartStore } from '~/stores/cart'

declare const definePageMeta: (meta: Record<string, any>) => void

definePageMeta({ middleware: 'auth' })

const cart = useCartStore()
const nuxtApp = useNuxtApp()
const fetcher = nuxtApp.$fetch as typeof $fetch
const message = ref('')
const submitting = ref(false)

const form = reactive({
  gameHandle: '',
  region: '',
  scheduleWindow: '',
  notes: '',
})

await useAsyncData('checkout-cart', async () => {
  if (!cart.items.length) {
    await cart.load()
  }
  return cart.items
})

const hasItems = computed(() => cart.items.length > 0)
const subtotal = computed(() => cart.subtotal)

const submitOrder = async () => {
  if (!hasItems.value) {
    message.value = 'Add at least one service before checking out.'
    return
  }

  submitting.value = true
  message.value = ''
  try {
    await fetcher('/api/orders', {
      method: 'POST',
      body: {
        gameHandle: form.gameHandle,
        region: form.region,
        scheduleWindow: form.scheduleWindow,
        ...(form.notes ? { notes: form.notes } : {}),
      },
    })
    cart.clear()
    await navigateTo('/orders?alert=success')
  } catch (err: any) {
    message.value = err?.data?.message || err?.message || 'Unable to submit order'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="space-y-8">
    <header class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <p class="text-sm uppercase tracking-widest text-brand-light">Checkout</p>
      <h1 class="text-3xl font-semibold text-white">Secure order handoff</h1>
      <p class="text-sm text-slate-400">
        Provide in-game credentials or notes so our vetted sellers can deliver the boost on schedule.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-3">
      <form class="space-y-4 lg:col-span-2" @submit.prevent="submitOrder">
        <div class="card space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <label class="text-sm text-slate-300">
              In-game username / handle
              <input v-model="form.gameHandle" type="text" required minlength="3" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" placeholder="Example: Valorant#NA123" />
            </label>
            <label class="text-sm text-slate-300">
              Region & platform
              <input v-model="form.region" type="text" required minlength="2" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" placeholder="NA · PC" />
            </label>
          </div>
          <label class="text-sm text-slate-300">
            Preferred schedule window
            <input v-model="form.scheduleWindow" type="text" required minlength="3" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" placeholder="Weeknights 6-10pm PST" />
          </label>
          <label class="text-sm text-slate-300">
            Notes for the seller
            <textarea v-model="form.notes" rows="4" maxlength="500" class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" placeholder="Provide additional context, skins to use, comms, etc." />
          </label>
        </div>
        <button type="submit" class="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40" :disabled="!hasItems || submitting">
          {{ submitting ? 'Sending order...' : 'Place order' }}
        </button>
        <p v-if="message" class="text-sm text-rose-400">{{ message }}</p>
        <div v-if="!hasItems" class="rounded-lg border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          Your cart is empty. <NuxtLink to="/games/cs2" class="underline">Browse services</NuxtLink> to continue.
        </div>
      </form>

      <aside class="space-y-4">
        <div class="card space-y-3">
          <h2 class="text-lg font-semibold text-white">Order summary</h2>
          <p class="text-sm text-slate-400">{{ cart.items.length }} services selected</p>
          <ul class="space-y-3 text-sm text-slate-300">
            <li v-for="item in cart.items" :key="item._id" class="flex items-start justify-between gap-3">
              <div>
                <p class="font-semibold text-white">{{ item.service?.title }}</p>
                <p class="text-xs text-slate-400">{{ item.quantity }} × ${{ item.service?.price }}</p>
              </div>
              <p class="text-white">${{ (item.service?.price || 0) * item.quantity }}</p>
            </li>
          </ul>
          <div class="flex items-center justify-between border-t border-white/10 pt-3 text-sm text-slate-300">
            <span>Total due today</span>
            <span class="text-2xl font-semibold text-white">${{ subtotal.toFixed(2) }}</span>
          </div>
        </div>
        <div class="rounded-lg border border-white/10 bg-slate-900/70 p-4 text-xs text-slate-400">
          <p class="font-semibold text-white">Security tips</p>
          <ul class="mt-2 list-disc space-y-2 pl-4">
            <li>We never ask for two-factor backup codes.</li>
            <li>Change your password after fulfilment.</li>
            <li>All boosters sign NDAs and are background checked.</li>
          </ul>
        </div>
      </aside>
    </div>
  </section>
</template>
