<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, navigateTo } from 'nuxt/app'
import { useCartStore } from '~/stores/cart'

declare const definePageMeta: (meta: Record<string, any>) => void

definePageMeta({ middleware: 'auth' })

const cart = useCartStore()

await useAsyncData('cart-page', async () => {
  if (!cart.items.length) {
    await cart.load()
  }
  return cart.items
})

const hasItems = computed(() => cart.items.length > 0)

const adjustQuantity = async (itemId: string, nextValue: number) => {
  if (nextValue < 1) return
  await cart.updateItem(itemId, { quantity: nextValue })
}

const removeItem = async (itemId: string) => {
  await cart.removeItem(itemId)
}

const onQuantityChange = async (itemId: string, event: Event) => {
  const target = event.target as { value?: string } | null
  const nextValue = Number(target?.value ?? 1)
  await adjustQuantity(itemId, nextValue)
}

const onNotesChange = async (itemId: string, event: Event) => {
  const target = event.target as { value?: string } | null
  await cart.updateItem(itemId, { notes: target?.value ?? '' })
}

const proceedToCheckout = () => {
  if (!hasItems.value) return
  navigateTo('/checkout')
}
</script>

<template>
  <section class="space-y-8">
    <header class="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
      <p class="text-sm uppercase tracking-widest text-brand-light">Cart</p>
      <h1 class="text-3xl font-semibold text-white">Review your services</h1>
      <p class="text-sm text-slate-400">
        Adjust quantities, leave seller notes, and proceed to checkout to submit your boosting request.
      </p>
    </header>

    <div class="grid gap-8 lg:grid-cols-3">
      <div class="space-y-4 lg:col-span-2">
        <div v-if="!hasItems" class="card text-center text-sm text-slate-400">
          Your cart is empty. Browse the catalog to add services.
        </div>
        <article
          v-for="item in cart.items"
          :key="item._id"
          class="card space-y-4"
        >
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-widest text-brand-light">{{ item.service?.game?.name }}</p>
              <h2 class="text-xl font-semibold text-white">{{ item.service?.title }}</h2>
              <p class="text-sm text-slate-400">{{ item.service?.description }}</p>
            </div>
            <button class="text-sm text-slate-400 hover:text-brand-light" @click="removeItem(item._id)">
              Remove
            </button>
          </div>
          <div class="grid gap-4 text-sm md:grid-cols-3">
            <label class="flex flex-col gap-2">
              <span class="text-slate-400">Quantity</span>
              <input
                type="number"
                min="1"
                max="25"
                class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                :value="item.quantity"
                @change="(event) => onQuantityChange(item._id, event)"
              />
            </label>
            <label class="md:col-span-2 flex flex-col gap-2">
              <span class="text-slate-400">Notes</span>
              <textarea
                rows="2"
                class="rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2"
                :value="item.notes"
                @change="(event) => onNotesChange(item._id, event)"
              />
            </label>
          </div>
          <div class="flex items-center justify-between text-sm text-slate-300">
            <span>Unit price</span>
            <span class="text-lg font-semibold text-white">${{ item.service?.price }}</span>
          </div>
          <div class="flex items-center justify-between text-sm text-slate-300">
            <span>Line total</span>
            <span class="text-lg font-semibold text-white">${{ (item.service?.price || 0) * item.quantity }}</span>
          </div>
        </article>
      </div>
      <aside class="card space-y-4">
        <h2 class="text-lg font-semibold text-white">Summary</h2>
        <div class="flex items-center justify-between text-sm text-slate-300">
          <span>Subtotal</span>
          <span class="text-2xl font-semibold text-white">${{ cart.subtotal.toFixed(2) }}</span>
        </div>
        <p class="text-xs text-slate-400">
          Taxes and fees will be finalized with our payment provider. Checkout instructions capture in-game credentials securely.
        </p>
        <button
          class="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="!hasItems"
          @click="proceedToCheckout"
        >
          Continue to checkout
        </button>
      </aside>
    </div>
  </section>
</template>
