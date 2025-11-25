<script setup lang="ts">
import { reactive, ref } from 'vue'
import { navigateTo } from 'nuxt/app'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const form = reactive({
  email: '',
  password: '',
})
const message = ref('')

const handleSubmit = async () => {
  message.value = ''
  console.log('🔵 Login form submitted:', form)
  try {
    console.log('🔵 Calling auth.login...')
    await auth.login(form)
    console.log('✅ Login successful, navigating...')
    await navigateTo('/')
  } catch (err: any) {
    console.error('❌ Login error:', err)
    message.value = err?.statusMessage || err?.message || 'Unable to login'
  }
}
</script>

<template>
  <section class="mx-auto max-w-md space-y-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8">
    <div>
      <p class="text-sm uppercase tracking-widest text-brand-light">Welcome back</p>
      <h1 class="text-3xl font-semibold text-white">Login to manage your orders</h1>
      <p class="text-sm text-slate-400">
        Guests can preview the catalog, but carts and checkout require an account.
      </p>
    </div>
    <form class="space-y-4" @submit.prevent="handleSubmit">
      <label class="block text-sm text-slate-300">
        Email
        <input v-model="form.email" type="email" required class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
      </label>
      <label class="block text-sm text-slate-300">
        Password
        <input v-model="form.password" type="password" required class="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/80 px-3 py-2" />
      </label>
      <button type="submit" class="btn-primary w-full" :disabled="auth.loading">
        {{ auth.loading ? 'Signing in...' : 'Login' }}
      </button>
      <p v-if="message" class="text-sm text-rose-400">{{ message }}</p>
    </form>
  </section>
</template>
