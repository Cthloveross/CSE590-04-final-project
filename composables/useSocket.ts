import { io, Socket } from 'socket.io-client'
import type { Ref } from 'vue'
import { useCatalogStore } from '~/stores/catalog'

// Module-level shared state - singleton pattern
let socket: Socket | null = null
const isConnected = ref(false)
const notifications = ref<SocketNotification[]>([])
const onlineUsersCount = ref(0)

// Chat state
export interface ChatMessage {
  id: string
  username: string
  message: string
  timestamp: number
}

const chatMessages = ref<ChatMessage[]>([])
const typingUsers = ref<string[]>([])

export interface SocketNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
}

export const useSocket = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  // Sync state if socket already connected (e.g., after HMR)
  if (socket?.connected && !isConnected.value) {
    isConnected.value = true
  }

  // Function to authenticate user on socket
  const authenticateUser = () => {
    if (socket?.connected && authStore.user) {
      console.log('🔐 Authenticating user on socket:', authStore.user.email)
      socket.emit('authenticate', {
        userId: authStore.user._id,
        email: authStore.user.email,
        role: authStore.user.role,
      })
    }
  }

  // Watch for auth state changes and re-authenticate (only on client)
  if (import.meta.client) {
    watch(() => authStore.user, (newUser) => {
      if (newUser && socket?.connected) {
        console.log('👤 Auth state changed, re-authenticating socket')
        authenticateUser()
      }
    }, { immediate: true })
  }

  const connect = () => {
    if (socket?.connected) {
      isConnected.value = true
      // Re-authenticate if user is already logged in
      authenticateUser()
      return socket
    }

    // Use separate socket server URL
    const socketUrl = (config.public.socketUrl as string) || 'http://localhost:3001'
    console.log('🔌 Connecting to Socket.IO server:', socketUrl)

    socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket?.id)
      isConnected.value = true

      // Authenticate user if logged in
      authenticateUser()
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected')
      isConnected.value = false
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      isConnected.value = false
    })

    // Listen to online users count
    socket.on('users:online', (data: { count: number }) => {
      console.log('👥 Online users count updated:', data.count)
      onlineUsersCount.value = data.count
    })

    // Listen to order status updates
    socket.on('order:status_updated', (data: any) => {
      console.log('📦 Order status updated:', data)
      addNotification({
        id: Date.now().toString(),
        type: 'success',
        title: 'Order Status Updated',
        message: `Your order status has been changed to: ${data.status}`,
        timestamp: new Date(data.timestamp),
      })
    })

    // Listen to notifications
    socket.on('notification:new', (notification: any) => {
      console.log('🔔 New notification received:', notification)
      addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: 'New Notification',
        message: notification.message || 'You have a new notification',
        timestamp: new Date(notification.timestamp),
      })
    })

    // Listen to system messages
    socket.on('system:message', (data: { message: string; type: string }) => {
      console.log('📢 System message:', data)
      addNotification({
        id: Date.now().toString(),
        type: data.type as any,
        title: 'System Message',
        message: data.message,
        timestamp: new Date(),
      })
    })

    // Listen to new services
    socket.on('service:new', (data: any) => {
      console.log('🆕 New service created:', data)
      addNotification({
        id: Date.now().toString(),
        type: 'info',
        title: 'New Service Available',
        message: `${data.service?.title || 'A new service'} is now available!`,
        timestamp: new Date(data.timestamp),
      })
    })

    // Listen to stock updates (real-time inventory)
    socket.on('service:stock_updated', (data: { serviceId: string; stockQuantity: number; timestamp: number }) => {
      console.log('📊 Stock updated:', data.serviceId, '->', data.stockQuantity)
      // Import catalog store dynamically to avoid circular dependency
      try {
        const catalogStore = useCatalogStore()
        catalogStore.updateServiceStock(data.serviceId, data.stockQuantity)
      } catch (e) {
        console.warn('Could not update catalog store:', e)
      }
    })

    // Chat listeners
    socket.on('chat:message', (data: ChatMessage) => {
      console.log('💬 Chat message received:', data)
      chatMessages.value.push(data)
      // Keep only last 100 messages
      if (chatMessages.value.length > 100) {
        chatMessages.value = chatMessages.value.slice(-100)
      }
    })

    socket.on('chat:typing', (data: { username: string; isTyping: boolean }) => {
      if (data.isTyping) {
        if (!typingUsers.value.includes(data.username)) {
          typingUsers.value.push(data.username)
        }
      } else {
        typingUsers.value = typingUsers.value.filter(u => u !== data.username)
      }
    })

    socket.on('chat:history', (messages: ChatMessage[]) => {
      console.log('📜 Chat history received:', messages.length, 'messages')
      chatMessages.value = messages
    })

    return socket
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      socket = null
      isConnected.value = false
    }
  }

  const emit = (event: string, data?: any) => {
    if (socket?.connected) {
      socket.emit(event, data)
    } else {
      console.warn('Socket not connected. Cannot emit event:', event)
    }
  }

  const on = (event: string, callback: (data: any) => void) => {
    console.log(`📡 Registering listener for event: ${event}, socket exists: ${!!socket}, connected: ${socket?.connected}`)
    if (socket) {
      socket.on(event, callback)
      console.log(`✅ Listener registered for: ${event}`)
    } else {
      console.warn(`⚠️ Socket not initialized yet, cannot register listener for: ${event}`)
      // Try to connect and then register
      const s = connect()
      if (s) {
        s.on(event, callback)
        console.log(`✅ Listener registered after connect for: ${event}`)
      }
    }
  }

  const off = (event: string, callback?: (data: any) => void) => {
    if (socket) {
      socket.off(event, callback)
      console.log(`🔌 Listener removed for: ${event}`)
    }
  }

  const joinRoom = (roomId: string) => {
    emit('join:room', roomId)
  }

  const leaveRoom = (roomId: string) => {
    emit('leave:room', roomId)
  }

  const addNotification = (notification: SocketNotification) => {
    notifications.value.unshift(notification)
    // Keep only last 50 notifications
    if (notifications.value.length > 50) {
      notifications.value = notifications.value.slice(0, 50)
    }
  }

  const clearNotifications = () => {
    notifications.value = []
  }

  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  // Chat functions
  const sendChatMessage = (message: string) => {
    if (socket?.connected) {
      const authStore = useAuthStore()
      socket.emit('chat:message', {
        message,
        username: authStore.user?.email || authStore.user?.username || 'Anonymous'
      })
    }
  }

  const sendTypingIndicator = (isTyping: boolean) => {
    if (socket?.connected) {
      const authStore = useAuthStore()
      socket.emit('chat:typing', {
        username: authStore.user?.email || authStore.user?.username || 'Anonymous',
        isTyping
      })
    }
  }

  return {
    socket,
    isConnected: readonly(isConnected),
    notifications: readonly(notifications),
    onlineUsersCount: readonly(onlineUsersCount),
    // Chat exports
    chatMessages: readonly(chatMessages),
    onlineCount: readonly(onlineUsersCount),
    typingUsers: readonly(typingUsers),
    sendChatMessage,
    sendTypingIndicator,
    // Other functions
    connect,
    disconnect,
    emit,
    on,
    off,
    joinRoom,
    leaveRoom,
    addNotification,
    clearNotifications,
    removeNotification,
  }
}
