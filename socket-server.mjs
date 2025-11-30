import { createServer } from 'http'
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

const PORT = process.env.SOCKET_PORT || 3001
const CORS_ORIGIN = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const INSTANCE_ID = `socket-${process.pid}-${Date.now()}`

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: [CORS_ORIGIN, 'http://localhost:3000', 'http://localhost:30000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

// Redis clients for adapter and shared state
let redisClient = null
let isRedisConnected = false

// Redis Adapter for Scale-out (multiple Socket.IO instances)
async function setupRedisAdapter() {
  try {
    const pubClient = createClient({ url: REDIS_URL })
    const subClient = pubClient.duplicate()
    redisClient = createClient({ url: REDIS_URL })

    pubClient.on('error', (err) => console.log('Redis Pub Client Error:', err.message))
    subClient.on('error', (err) => console.log('Redis Sub Client Error:', err.message))
    redisClient.on('error', (err) => console.log('Redis Client Error:', err.message))

    await Promise.all([pubClient.connect(), subClient.connect(), redisClient.connect()])

    io.adapter(createAdapter(pubClient, subClient))
    isRedisConnected = true
    console.log(`✅ Redis Adapter connected: ${REDIS_URL}`)
    console.log(`✅ Instance ID: ${INSTANCE_ID}`)
    return true
  } catch (error) {
    console.log(`⚠️ Redis not available (${error.message}), running in single-instance mode`)
    isRedisConnected = false
    return false
  }
}

// Get online count from Redis (shared across all instances)
async function getOnlineCount() {
  if (isRedisConnected && redisClient) {
    try {
      const count = await redisClient.sCard('online_users')
      return count
    } catch (error) {
      console.log('Redis getOnlineCount error:', error.message)
    }
  }
  // Fallback to local count
  return onlineUsers.size
}

// Add user to Redis set
async function addOnlineUser(socketId, userId) {
  if (isRedisConnected && redisClient) {
    try {
      // Store both socketId and mapping
      await redisClient.sAdd('online_users', socketId)
      if (userId) {
        await redisClient.hSet('user_sockets', socketId, userId)
      }
    } catch (error) {
      console.log('Redis addOnlineUser error:', error.message)
    }
  }
}

// Remove user from Redis set
async function removeOnlineUser(socketId) {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.sRem('online_users', socketId)
      await redisClient.hDel('user_sockets', socketId)
    } catch (error) {
      console.log('Redis removeOnlineUser error:', error.message)
    }
  }
}

// Broadcast online count to all clients (via Redis pub/sub)
async function broadcastOnlineCount() {
  const count = await getOnlineCount()
  io.emit('users:online', { count })
}

// Setup Redis adapter (non-blocking, falls back to single instance if Redis unavailable)
setupRedisAdapter()

const onlineUsers = new Map() // Local map for this instance
const chatHistory = [] // Store last 100 messages (Note: in scale-out mode, use Redis for shared state)

io.on('connection', async (socket) => {
  console.log(`✅ Client connected: ${socket.id} (Instance: ${INSTANCE_ID})`)
  onlineUsers.set(socket.id, { socketId: socket.id })
  await addOnlineUser(socket.id, null)

  // Broadcast online count (from Redis)
  await broadcastOnlineCount()

  // Send chat history to new user
  if (chatHistory.length > 0) {
    socket.emit('chat:history', chatHistory)
  }

  // User authentication
  socket.on('authenticate', async (data) => {
    console.log(`👤 User authenticated: ${data.email} (${data.userId})`)
    onlineUsers.set(socket.id, { ...data, socketId: socket.id })
    await addOnlineUser(socket.id, data.userId)
    socket.join(`user:${data.userId}`)
    socket.join(`role:${data.role}`)
    await broadcastOnlineCount()
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

    const orderUpdatePayload = {
      orderId: data.orderId,
      status: data.status,
      userId: data.userId,
      timestamp: data.timestamp
    }

    // Send to specific user room
    io.to(`user:${data.userId}`).emit('order:status_updated', orderUpdatePayload)

    // ALSO broadcast to ALL connected clients (fallback if user hasn't joined their room yet)
    // Client-side will filter by userId
    io.emit('order:status_updated_broadcast', orderUpdatePayload)

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

  socket.on('disconnect', async (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} (${reason})`)
    onlineUsers.delete(socket.id)
    await removeOnlineUser(socket.id)
    await broadcastOnlineCount()
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
