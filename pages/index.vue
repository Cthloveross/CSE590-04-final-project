<script setup lang="ts">
import { useAsyncData } from 'nuxt/app'
import { useCatalogStore } from '~/stores/catalog'

const catalog = useCatalogStore()

await useAsyncData('home-games', async () => {
  if (!catalog.games.length) {
    await catalog.fetchGames()
  }
  return catalog.games
})
</script>

<template>
  <section class="space-y-12">
    <div class="grid gap-10 rounded-3xl border border-white/10 bg-gradient-to-r from-brand/30 to-slate-900/80 p-10 shadow-2xl shadow-brand/20 md:grid-cols-2">
      <div class="space-y-6">
        <p class="inline-flex items-center rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-widest text-white/80">
          Multiplayer Pros · On demand
        </p>
        <h1 class="text-4xl font-semibold leading-tight text-white md:text-5xl">
          Dominate your ranked climb with vetted boosters, coaches, and custom gaming services.
        </h1>
        <p class="text-base text-slate-200">
          Choose a title, mix services, and describe your perfect order. Our sellers handle the rest—securely and transparently.
        </p>
        <div class="flex gap-4">
          <NuxtLink to="/login" class="btn-primary">Sign in to bid</NuxtLink>
          <NuxtLink to="/games/cs2" class="rounded-md px-4 py-2 text-sm text-slate-200 hover:text-white">
            Explore CS2 auctions →
          </NuxtLink>
        </div>
        <dl class="grid gap-6 sm:grid-cols-3">
          <div>
            <dt class="text-xs uppercase tracking-wide text-slate-400">Avg. rating</dt>
            <dd class="text-3xl font-semibold text-white">4.9/5</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-slate-400">Orders fulfilled</dt>
            <dd class="text-3xl font-semibold text-white">12k+</dd>
          </div>
          <div>
            <dt class="text-xs uppercase tracking-wide text-slate-400">Supported titles</dt>
            <dd class="text-3xl font-semibold text-white">15</dd>
          </div>
        </dl>
      </div>
      <div class="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-6 text-sm text-slate-300 shadow-inner shadow-black/40">
        <p class="font-semibold text-white">How it works</p>
        <ol class="space-y-4">
          <li class="flex items-start gap-4">
            <span class="rounded-full bg-brand/30 px-3 py-1 text-sm font-semibold text-brand-light">01</span>
            <span>Sign in to track bids and get notified when you win.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="rounded-full bg-brand/30 px-3 py-1 text-sm font-semibold text-brand-light">02</span>
            <span>Pick a game, review live listings, and place competitive bids.</span>
          </li>
          <li class="flex items-start gap-4">
            <span class="rounded-full bg-brand/30 px-3 py-1 text-sm font-semibold text-brand-light">03</span>
            <span>Win the auction and schedule fulfillment directly with our pros.</span>
          </li>
        </ol>
      </div>
    </div>

    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm uppercase tracking-widest text-brand-light">Live Auctions</p>
          <h2 class="text-2xl font-semibold text-white">Pick a title to explore services</h2>
        </div>
        <NuxtLink to="/login" class="text-sm text-slate-300 hover:text-white">Sign in to manage bids →</NuxtLink>
      </div>
      <div class="grid gap-6 md:grid-cols-3">
        <div
          v-for="game in catalog.games"
          :key="game._id"
          class="card space-y-4"
        >
          <img :src="game.iconUrl" :alt="game.name" class="h-24 w-24 rounded-lg border border-white/20" />
          <div>
            <p class="text-lg font-semibold text-white">{{ game.name }}</p>
            <p class="text-sm text-slate-400">{{ game.description }}</p>
          </div>
          <NuxtLink :to="`/games/${game.slug}`" class="btn-primary w-full text-center">View services</NuxtLink>
        </div>
      </div>
    </section>
  </section>
</template>
