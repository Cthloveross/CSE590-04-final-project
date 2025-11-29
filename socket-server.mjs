import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = process.env.SOCKET_PORT || 3001
const CORS_ORIGIN = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: [CORS_ORIGIN, 'http://localhost:3000', 'http://localhost:30000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

const onlineUsers = new Map()
const chatHistory = [] // Store last 100 messages

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`)
  onlineUsers.set(socket.id, { socketId: socket.id })
  
  // Broadcast online count
  io.emit('users:online', { count: onlineUsers.size })
  
  // Send chat history to new user
  if (chatHistory.length > 0) {
    socket.emit('chat:history', chatHistory)
  }

  // User authentication
  socket.on('authenticate', (data) => {
    console.log(`👤 User authenticated: ${data.email} (${data.userId})`)
    onlineUsers.set(socket.id, { ...data, socketId: socket.id })
    socket.join(`user:${data.userId}`)
    socket.join(`role:${data.role}`)
    io.emit('users:online', { count: onlineUsers.size })
  })

  // Chat message
  socket.on('chat:message', (data) => {
    console.log(`💬 Chat: ${data.username}: ${data.message}`)
    const chatMsg = {
      id: Date.now().toString(),
      username: data.username,
      message: data.message,
      timestamp: Date.now(),
      socketId: socket.id
    }
    // Store in history
    chatHistory.push(chatMsg)
    if (chatHistory.length > 100) {
      chatHistory.shift()
    }
    io.emit('chat:message', chatMsg)
  })

  // Typing indicator
  socket.on('chat:typing', (data) => {
    socket.broadcast.emit('chat:typing', { ...data, socketId: socket.id })
  })

  // Private message
  socket.on('message:private', (data) => {
    const user = onlineUsers.get(socket.id)
    const target = Array.from(onlineUsers.entries())
      .find(([_, u]) => u.userId === data.toUserId)
    if (target) {
      io.to(target[0]).emit('message:private', {
        fromUserId: user?.userId,
        fromUsername: user?.email,
        message: data.message,
        timestamp: Date.now(),
      })
    }
  })

  // Join/leave rooms
  socket.on('join:room', (roomId) => {
    socket.join(roomId)
    console.log(`📍 ${socket.id} joined room: ${roomId}`)
  })

  socket.on('leave:room', (roomId) => {
    socket.leave(roomId)
    console.log(`🚪 ${socket.id} left room: ${roomId}`)
  })

  // ========== Server-side events (from Nuxt API) ==========
  
  // Order status update from server
  socket.on('server:order_status_update', (data) => {
    console.log(`📦 Server: Order ${data.orderId} status: ${data.status} for user ${data.userId}`)
    // Send to specific user
    io.to(`user:${data.userId}`).emit('order:status_updated', {
      orderId: data.orderId,
      status: data.status,
      timestamp: data.timestamp
    })
    // Also send notification
    io.to(`user:${data.userId}`).emit('notification:new', {
      type: 'order_update',
      title: 'Order Status Updated',
      message: `Your order status has been changed to: ${data.status}`,
      orderId: data.orderId,
      timestamp: data.timestamp
    })
    // Notify admins too
    io.to('role:admin').emit('order:updated', data)
  })

  // New service from server
  socket.on('server:new_service', (data) => {
    console.log(`🆕 Server: New service created:`, data.service?.title)
    io.emit('service:new', data)
    io.emit('notification:new', {
      type: 'new_service',
      title: 'New Service Available',
      message: `${data.service?.title || 'A new service'} is now available!`,
      timestamp: data.timestamp
    })
  })

  // Service update from server
  socket.on('server:service_update', (data) => {
    console.log(`🔄 Server: Service updated:`, data.serviceId)
    io.emit('service:updated', data)
    io.to(`service:${data.serviceId}`).emit('service:data_changed', data)
  })

  // Service deleted from server
  socket.on('server:service_deleted', (data) => {
    console.log(`🗑️ Server: Service deleted:`, data.serviceId)
    io.emit('service:deleted', data)
  })

  // Bid update from server
  socket.on('server:bid_update', (data) => {
    console.log(`💰 Server: Bid update on service:`, data.serviceId)
    io.to(`service:${data.serviceId}`).emit('bid:new', data)
    io.emit('bid:update', data)
  })

  // Stock update from server
  socket.on('server:stock_update', (data) => {
    console.log(`📊 Server: Stock updated for service ${data.serviceId}: ${data.stockQuantity}`)
    io.emit('service:stock_updated', data)
  })

  // Notify specific user from server
  socket.on('server:notify_user', (data) => {
    console.log(`🔔 Server: Notifying user ${data.userId}`)
    io.to(`user:${data.userId}`).emit('notification:new', {
      ...data.notification,
      timestamp: data.timestamp
    })
  })

  // System message from server
  socket.on('server:system_message', (data) => {
    console.log(`📢 Server: System message: ${data.message}`)
    io.emit('system:message', data)
  })

  socket.on('disconnect', (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} (${reason})`)
    onlineUsers.delete(socket.id)
    io.emit('users:online', { count: onlineUsers.size })
  })
})

// Export for API routes to emit events
globalThis.socketIO = io

// Helper functions
globalThis.emitOrderStatusUpdate = (orderId, status, userId) => {
  console.log(`📦 Order ${orderId} status: ${status} for user ${userId}`)
  io.to(`user:${userId}`).emit('order:status_updated', {
    orderId, status, userId, timestamp: Date.now()
  })
  io.to(`user:${userId}`).emit('notification:new', {
    type: 'order_update',
    title: 'Order Status Updated',
    message: `Your order has been ${status}`,
    orderId,
    timestamp: Date.now()
  })
}

globalThis.emitNewService = (service) => {
  console.log(`🎮 New service: ${service.title}`)
  io.emit('service:new', {
    serviceId: service._id?.toString(),
    name: service.title,
    timestamp: Date.now()
  })
  io.emit('notification:new', {
    type: 'new_service',
    title: 'New Service Available',
    message: `${service.title} is now available`,
    timestamp: Date.now()
  })
}

globalThis.emitSystemMessage = (message, type = 'info') => {
  io.emit('system:message', { message, type, timestamp: Date.now() })
}

httpServer.listen(PORT, () => {
  console.log(`\n🚀 Socket.IO Central Server running on port ${PORT}`)
  console.log(`   📍 CORS Origin: ${CORS_ORIGIN}`)
  console.log(`   🔄 Transports: websocket, polling`)
  console.log(`   ✨ Features: chat, notifications, private messages\n`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  io.close()
  httpServer.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('\n👋 Shutting down Socket.IO server...')
  io.close()
  httpServer.close()
  process.exit(0)
})
