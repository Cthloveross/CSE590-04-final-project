import { defineNuxtConfig } from 'nuxt/config'

// Get the base site URL from environment, defaulting to localhost:3000 for local dev
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    'nuxt-auth-utils',
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    mongodbUri: process.env.MONGODB_URI || '',
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    session: {
      password: process.env.NUXT_SESSION_PASSWORD ?? '',
    },
    oauth: {
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET ?? '',
        // Use siteUrl as base so it works for both local dev (3000) and k8s (30000)
        redirectURL: process.env.NUXT_OAUTH_GOOGLE_REDIRECT_URL ?? `${siteUrl}/api/auth/callback/google`,
      },
      github: {
        clientId: process.env.NUXT_OAUTH_GITHUB_CLIENT_ID ?? '',
        clientSecret: process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET ?? '',
        // Use siteUrl as base so it works for both local dev (3000) and k8s (30000)
        redirectURL: process.env.NUXT_OAUTH_GITHUB_REDIRECT_URL ?? `${siteUrl}/api/auth/callback/github`,
      },
    },
    public: {
      siteUrl: siteUrl,
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3001',
    },
  },
})
