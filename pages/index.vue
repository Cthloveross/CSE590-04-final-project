<script setup lang="ts">
import { useAsyncData } from 'nuxt/app'
import { useCatalogStore } from '~/stores/catalog'
import { useAuthStore } from '~/stores/auth'

const catalog = useCatalogStore()
const auth = useAuthStore()

await useAsyncData('home-games', async () => {
  if (!catalog.games.length) {
    await catalog.fetchGames()
  }
  return catalog.games
})

const features = [
  {
    icon: '🎯',
    title: 'Verified Boosters',
    description: 'All our sellers are background-checked and reviewed by real players'
  },
  {
    icon: '🔒',
    title: 'Secure Transactions',
    description: 'Your credentials are encrypted and never shared beyond your assigned booster'
  },
  {
    icon: '⚡',
    title: 'Fast Delivery',
    description: 'Most orders completed within 24-48 hours with live progress updates'
  },
  {
    icon: '💬',
    title: '24/7 Support',
    description: 'Our team is always ready to help with any questions or issues'
  }
]
</script>

<template>
  <section class="space-y-16">
    <!-- Hero Section -->
    <div class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-brand/20">
      <!-- Background pattern -->
      <div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>
      
      <div class="relative grid gap-8 p-8 md:grid-cols-2 md:p-12 lg:p-16">
        <div class="space-y-6">
          <div class="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm text-brand-light">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-brand-light"></span>
            </span>
            CS2 Services Live
          </div>
          
          <h1 class="text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
            Level up your 
            <span class="bg-gradient-to-r from-brand to-cyan-400 bg-clip-text text-transparent">
              Counter-Strike 2
            </span>
            experience
          </h1>
          
          <p class="text-lg text-slate-300 max-w-lg">
            Browse professional boosting, coaching, and custom services. Bid on auctions or buy instantly from verified sellers.
          </p>
          
          <div class="flex flex-wrap gap-4">
            <NuxtLink 
              to="/games/cs2" 
              class="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-dark px-6 py-3 font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:scale-105"
            >
              Browse CS2 Services
              <svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
            <NuxtLink 
              v-if="!auth.isAuthenticated"
              to="/login" 
              class="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition-all hover:bg-white/5 hover:border-white/30"
            >
              Sign in to bid
            </NuxtLink>
          </div>

          <div class="flex items-center gap-8 pt-4">
            <div>
              <p class="text-3xl font-bold text-white">4.9<span class="text-brand">/5</span></p>
              <p class="text-sm text-slate-400">Avg. rating</p>
            </div>
            <div class="h-12 w-px bg-white/10"></div>
            <div>
              <p class="text-3xl font-bold text-white">12k<span class="text-brand">+</span></p>
              <p class="text-sm text-slate-400">Orders completed</p>
            </div>
            <div class="h-12 w-px bg-white/10"></div>
            <div>
              <p class="text-3xl font-bold text-white">200<span class="text-brand">+</span></p>
              <p class="text-sm text-slate-400">Active sellers</p>
            </div>
          </div>
        </div>

        <div class="hidden md:flex items-center justify-center">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-brand to-cyan-500 rounded-3xl blur-3xl opacity-20"></div>
            <div class="relative rounded-2xl border border-white/10 bg-slate-800/50 p-6 backdrop-blur space-y-4">
              <div class="flex items-center gap-3">
                <div class="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-2xl">
                  🎮
                </div>
                <div>
                  <p class="font-semibold text-white">How it works</p>
                  <p class="text-sm text-slate-400">3 simple steps</p>
                </div>
              </div>
              <ol class="space-y-3">
                <li class="flex items-start gap-3">
                  <span class="flex h-7 w-7 items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-brand-light">1</span>
                  <div>
                    <p class="font-medium text-white">Choose a service</p>
                    <p class="text-sm text-slate-400">Browse auctions or buy instantly</p>
                  </div>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex h-7 w-7 items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-brand-light">2</span>
                  <div>
                    <p class="font-medium text-white">Provide details</p>
                    <p class="text-sm text-slate-400">Share your in-game info securely</p>
                  </div>
                </li>
                <li class="flex items-start gap-3">
                  <span class="flex h-7 w-7 items-center justify-center rounded-full bg-brand/20 text-sm font-bold text-brand-light">3</span>
                  <div>
                    <p class="font-medium text-white">Track progress</p>
                    <p class="text-sm text-slate-400">Watch your order get fulfilled live</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div 
        v-for="feature in features" 
        :key="feature.title"
        class="group rounded-2xl border border-white/5 bg-slate-900/30 p-6 transition-all hover:border-white/10 hover:bg-slate-900/50"
      >
        <div class="mb-4 text-3xl">{{ feature.icon }}</div>
        <h3 class="mb-2 font-semibold text-white">{{ feature.title }}</h3>
        <p class="text-sm text-slate-400">{{ feature.description }}</p>
      </div>
    </div>

    <!-- Games Section -->
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium uppercase tracking-widest text-brand-light">Available Games</p>
          <h2 class="text-2xl font-bold text-white">Choose your battlefield</h2>
        </div>
        <NuxtLink 
          v-if="!auth.isAuthenticated"
          to="/login" 
          class="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Sign in to manage bids →
        </NuxtLink>
      </div>

      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="game in catalog.games"
          :key="game._id"
          :to="`/games/${game.slug}`"
          class="group relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 transition-all hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10"
        >
          <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
          <div class="relative p-6 space-y-4">
            <div class="flex items-center gap-4">
              <img 
                :src="game.iconUrl" 
                :alt="game.name" 
                class="h-16 w-16 rounded-xl border border-white/10 shadow-lg transition-transform group-hover:scale-110" 
              />
              <div>
                <h3 class="text-xl font-bold text-white">{{ game.name }}</h3>
                <p class="text-sm text-slate-400">{{ game.description }}</p>
              </div>
            </div>
            <div class="flex items-center justify-between pt-2">
              <span class="text-sm text-slate-400">View services</span>
              <svg class="w-5 h-5 text-brand transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- CTA Section -->
    <div class="rounded-3xl border border-brand/20 bg-gradient-to-r from-brand/10 via-slate-900 to-cyan-500/10 p-8 md:p-12 text-center">
      <h2 class="text-3xl font-bold text-white mb-4">Ready to dominate the ranks?</h2>
      <p class="text-slate-300 max-w-2xl mx-auto mb-8">
        Join thousands of satisfied players who've boosted their gaming experience with our verified services.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <NuxtLink 
          to="/games/cs2" 
          class="rounded-xl bg-gradient-to-r from-brand to-brand-dark px-8 py-3 font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:scale-105"
        >
          Start Shopping
        </NuxtLink>
        <NuxtLink 
          v-if="!auth.isAuthenticated"
          to="/login" 
          class="rounded-xl border border-white/20 px-8 py-3 font-semibold text-white transition-all hover:bg-white/5"
        >
          Create Account
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
