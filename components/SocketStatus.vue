<template>
  <div class="socket-status-container fixed bottom-4 right-4 z-50">
    <!-- Chat Widget -->
    <ChatWidget v-if="showChat" @close="showChat = false" class="mb-4" />
    
    <!-- Connection Status -->
    <div
      class="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 shadow-lg flex items-center gap-3"
    >
      <!-- Status Indicator -->
      <div class="flex items-center gap-2">
        <div
          class="w-2 h-2 rounded-full"
          :style="{ backgroundColor: isConnected ? '#22c55e' : '#f87171' }"
          :class="isConnected ? 'animate-pulse' : ''"
        ></div>
        <span class="text-sm" :style="{ color: isConnected ? '#4ade80' : '#f87171' }">
          {{ isConnected ? 'Connected' : 'Disconnected' }}
        </span>
      </div>

      <!-- Online Users Count -->
      <div v-if="isConnected && onlineUsersCount > 0" class="flex items-center gap-2 border-l border-white/10 pl-3">
        <svg class="w-4 h-4 text-brand-light" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
        <span class="text-sm text-slate-300">{{ onlineUsersCount }} online</span>
      </div>

      <!-- Chat Button -->
      <button
        v-if="isConnected"
        @click.stop="toggleChat"
        class="flex items-center gap-2 border-l border-white/10 pl-3 text-slate-300 hover:text-green-400 transition-colors cursor-pointer"
        :class="{ 'text-green-400': showChat }"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span class="text-sm">Chat</span>
      </button>

      <!-- Notifications Badge -->
      <div
        v-if="notifications.length > 0"
        class="flex items-center gap-2 border-l border-white/10 pl-3 cursor-pointer hover:text-brand-light transition-colors"
        @click="showNotifications = !showNotifications"
      >
        <div class="relative">
          <svg class="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          <span
            class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
          >
            {{ notifications.length > 9 ? '9+' : notifications.length }}
          </span>
        </div>
      </div>
    </div>

    <!-- Notifications Panel -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div
        v-if="showNotifications && notifications.length > 0"
        class="absolute bottom-full right-0 mb-2 w-96 max-h-96 overflow-y-auto bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl"
      >
        <div class="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 class="text-white font-semibold">Notifications</h3>
          <button
            @click="clearNotifications"
            class="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Clear all
          </button>
        </div>
        <div class="divide-y divide-white/5">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="p-4 hover:bg-white/5 transition-colors"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="{
                      'bg-blue-400': notification.type === 'info',
                      'bg-emerald-400': notification.type === 'success',
                      'bg-amber-400': notification.type === 'warning',
                      'bg-red-400': notification.type === 'error',
                    }"
                  ></span>
                  <h4 class="text-white font-medium text-sm">{{ notification.title }}</h4>
                </div>
                <p class="text-slate-300 text-sm">{{ notification.message }}</p>
                <p class="text-slate-500 text-xs mt-1">
                  {{ formatTimestamp(notification.timestamp) }}
                </p>
              </div>
              <button
                @click="removeNotification(notification.id)"
                class="text-slate-400 hover:text-white transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const { isConnected, notifications, onlineUsersCount, clearNotifications, removeNotification } = useSocket()
const showNotifications = ref(false)
const showChat = ref(false)

const toggleChat = () => {
  showChat.value = !showChat.value
  console.log('🗨️ Chat toggled:', showChat.value)
}

const formatTimestamp = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

// Close notifications panel when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.socket-status-container')) {
    showNotifications.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  console.log('🔔 SocketStatus component mounted')
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

// Watch for connection changes
watch(isConnected, (connected) => {
  console.log('🔌 Connection status changed:', connected ? 'Connected' : 'Disconnected')
})

// Watch for notifications changes
watch(notifications, (newNotifications) => {
  console.log('🔔 Notifications updated, count:', newNotifications.length)
}, { deep: true })
</script>
