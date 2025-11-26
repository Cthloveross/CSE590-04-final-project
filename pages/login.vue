<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { navigateTo, useRoute } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()

const form = reactive({
  email: '',
  password: '',
})
const message = ref('')
const isLoading = ref(false)

// Check for OAuth errors in URL
const oauthError = computed(() => {
  const error = route.query.error as string
  if (error === 'google_auth_failed') return 'Google authentication failed. Please try again.'
  if (error === 'github_auth_failed') return 'GitHub authentication failed. Please try again.'
  return null
})

const handleSubmit = async () => {
  message.value = ''
  isLoading.value = true
  try {
    await auth.login(form)
    const redirect = route.query.redirect as string
    await navigateTo(redirect || '/')
  } catch (err: any) {
    message.value = err?.statusMessage || err?.message || 'Unable to login'
  } finally {
    isLoading.value = false
  }
}

const loginWithGoogle = () => {
  window.location.href = '/api/auth/callback/google'
}

const loginWithGitHub = () => {
  window.location.href = '/api/auth/callback/github'
}
</script>

<template>
  <section class="min-h-[80vh] flex items-center justify-center">
    <div class="w-full max-w-md">
      <!-- Background effects -->
      <div class="absolute inset-0 -z-10 overflow-hidden">
        <div class="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand/20 blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"></div>
      </div>

      <div class="space-y-8 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-brand/10 backdrop-blur-xl">
        <!-- Header -->
        <div class="text-center space-y-2">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand to-cyan-500 mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p class="text-sm text-slate-400">
            Sign in to access your auctions, cart, and orders
          </p>
        </div>

        <!-- OAuth Error Alert -->
        <div v-if="oauthError" class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            {{ oauthError }}
          </div>
        </div>

        <!-- OAuth Buttons -->
        <div class="space-y-3">
          <button
            type="button"
            @click="loginWithGoogle"
            class="group relative w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-brand/5"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
            <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-brand/0 via-brand/5 to-brand/0 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </button>

          <button
            type="button"
            @click="loginWithGitHub"
            class="group relative w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-brand/5"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>Continue with GitHub</span>
            <div class="absolute inset-0 rounded-xl bg-gradient-to-r from-brand/0 via-brand/5 to-brand/0 opacity-0 transition-opacity group-hover:opacity-100"></div>
          </button>
        </div>

        <!-- Divider -->
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-white/10"></div>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-slate-900/80 px-4 text-slate-500">or continue with email</span>
          </div>
        </div>

        <!-- Email Login Form -->
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-300">
              Email address
            </label>
            <input 
              v-model="form.email" 
              type="email" 
              required 
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20" 
            />
          </div>
          <div class="space-y-2">
            <label class="block text-sm font-medium text-slate-300">
              Password
            </label>
            <input 
              v-model="form.password" 
              type="password" 
              required 
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white placeholder-slate-500 transition-all focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20" 
            />
          </div>
          
          <button 
            type="submit" 
            class="relative w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 transition-all hover:shadow-xl hover:shadow-brand/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            :disabled="isLoading || auth.loading"
          >
            <span v-if="isLoading || auth.loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>
          
          <p v-if="message" class="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 text-center">
            {{ message }}
          </p>
        </form>

        <!-- Demo accounts -->
        <div class="rounded-xl border border-white/5 bg-slate-950/30 p-4 space-y-2">
          <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Demo Accounts</p>
          <div class="grid grid-cols-2 gap-3 text-xs text-slate-400">
            <div class="space-y-1">
              <p class="font-medium text-slate-300">Admin</p>
              <p>admin@example.com</p>
              <p>admin12345</p>
            </div>
            <div class="space-y-1">
              <p class="font-medium text-slate-300">User</p>
              <p>user@example.com</p>
              <p>user12345</p>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-slate-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </section>
</template>
