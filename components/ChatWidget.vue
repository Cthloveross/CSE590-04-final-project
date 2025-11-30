<template>
  <div class="chat-widget fixed bottom-20 right-4 w-96 bg-slate-900 rounded-lg shadow-2xl border border-white/10 overflow-hidden z-40">
    <!-- Header -->
    <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <div>
          <h3 class="font-semibold">Global Chat</h3>
          <p class="text-xs opacity-90">{{ typingUsers.length > 0 ? `${typingUsers[0]} is typing...` : `${onlineCount} online` }}</p>
        </div>
      </div>
      <button @click="$emit('close')" class="hover:bg-white/20 rounded p-1 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <!-- Messages -->
    <div ref="messagesContainer" class="h-96 overflow-y-auto p-4 space-y-3 bg-slate-950">
      <div v-if="chatMessages.length === 0" class="text-center text-slate-500 mt-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p>No messages yet</p>
        <p class="text-sm">Start the conversation!</p>
      </div>

      <div
        v-for="msg in chatMessages"
        :key="msg.id"
        :class="[
          'flex',
          msg.username === authStore.user?.username ? 'justify-end' : 'justify-start'
        ]"
      >
        <div
          :class="[
            'max-w-xs rounded-lg p-3 shadow',
            msg.username === authStore.user?.username
              ? 'bg-blue-500 text-white'
              : 'bg-slate-800 text-white'
          ]"
        >
          <p class="text-xs font-semibold mb-1 opacity-75">{{ msg.username }}</p>
          <p class="text-sm break-words">{{ msg.message }}</p>
          <p class="text-xs mt-1 opacity-60">{{ formatTime(msg.timestamp) }}</p>
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="p-4 border-t border-white/10 bg-slate-900">
      <div v-if="!authStore.user" class="text-center text-slate-500 py-2">
        <p class="text-sm">Please <NuxtLink to="/login" class="text-blue-500 hover:underline">login</NuxtLink> to chat</p>
      </div>
      <div v-else class="flex space-x-2">
        <input
          v-model="message"
          @keyup.enter="sendMessage"
          @input="handleTyping"
          type="text"
          placeholder="Type a message..."
          class="flex-1 px-4 py-2 border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-800 text-white placeholder-slate-500"
        />
        <button
          @click="sendMessage"
          :disabled="!message.trim()"
          class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['close'])
const authStore = useAuthStore()
const { chatMessages, onlineCount, typingUsers, sendChatMessage, sendTypingIndicator } = useSocket()

const message = ref('')
const messagesContainer = ref<HTMLElement>()
let typingTimeout: NodeJS.Timeout

const sendMessage = () => {
  if (!message.value.trim()) return
  
  sendChatMessage(message.value)
  message.value = ''
  sendTypingIndicator(false)
}

const handleTyping = () => {
  sendTypingIndicator(true)
  
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    sendTypingIndicator(false)
  }, 1000)
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

// Auto-scroll to bottom when new messages arrive
watch(() => chatMessages.value.length, () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
})
</script>

<style scoped>
.chat-widget {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
