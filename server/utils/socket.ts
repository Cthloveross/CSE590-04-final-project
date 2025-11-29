import type { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { io as SocketIOClient, Socket as ClientSocket } from 'socket.io-client'
import type { Socket } from 'socket.io'

let io: SocketIOServer | null = null
let socketClient: ClientSocket | null = null

// Get or create a client connection to the standalone Socket.IO server
function getSocketClient(): ClientSocket {
  if (!socketClient || !socketClient.connected) {
    const socketUrl = process.env.SOCKET_SERVER_URL || 'http://localhost:3001'
    socketClient = SocketIOClient(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
    })
    
    socketClient.on('connect', () => {
      console.log('🔌 Server socket client connected to Socket.IO server')
      // Authenticate as server
      socketClient?.emit('authenticate', {
        userId: 'server',
        email: 'server@system',
        role: 'server',
      })
    })
    
    socketClient.on('disconnect', () => {
      console.log('❌ Server socket client disconnected')
    })
  }
  return socketClient
}

export interface SocketUser {
  userId: string
  email: string
  role: string
  socketId: string
}

// Store connected users
const connectedUsers = new Map<string, SocketUser>()

export function initializeSocketIO(httpServer: HTTPServer) {
  if (io) {
    console.log('⚠️ Socket.IO already initialized, skipping...')
    return io
  }

  console.log('🚀 Initializing Socket.IO server...')

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
  })

  io.on('connection', (socket: Socket) => {
    console.log('🔌 Client connected:', socket.id)

    // Send current online count immediately
    io?.emit('users:online', {
      count: connectedUsers.size + 1, // +1 for this new connection
      timestamp: new Date(),
    })

    // Handle user authentication
    socket.on('authenticate', (userData: { userId: string; email: string; role: string }) => {
      connectedUsers.set(socket.id, {
        ...userData,
        socketId: socket.id,
      })
      console.log('✅ User authenticated:', userData.email, '| Total users:', connectedUsers.size)

      // Join user-specific room
      socket.join(`user:${userData.userId}`)

      // Join role-specific rooms
      socket.join(`role:${userData.role}`)

      // Notify all about updated online users count
      io?.emit('users:online', {
        count: connectedUsers.size,
        timestamp: new Date(),
      })
    })

    // Handle joining specific rooms (e.g., game rooms, order rooms)
    socket.on('join:room', (roomId: string) => {
      socket.join(roomId)
      console.log(`📍 Socket ${socket.id} joined room: ${roomId}`)
    })

    socket.on('leave:room', (roomId: string) => {
      socket.leave(roomId)
      console.log(`🚪 Socket ${socket.id} left room: ${roomId}`)
    })

    // Handle bid updates
    socket.on('bid:placed', (data: { serviceId: string; bidAmount: number; userId: string }) => {
      io?.to(`service:${data.serviceId}`).emit('bid:update', data)
      console.log('💰 Bid placed on service:', data.serviceId)
    })

    // Handle typing indicators for chat/notes
    socket.on('typing:start', (data: { roomId: string; userName: string }) => {
      socket.to(data.roomId).emit('user:typing', data)
    })

    socket.on('typing:stop', (data: { roomId: string }) => {
      socket.to(data.roomId).emit('user:stopped_typing', data)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id)
      if (user) {
        console.log('👋 User disconnected:', user.email, '| Remaining users:', connectedUsers.size - 1)
        connectedUsers.delete(socket.id)

        // Notify others about online users count
        io?.emit('users:online', {
          count: connectedUsers.size,
          timestamp: new Date(),
        })
      } else {
        console.log('🔌 Client disconnected:', socket.id)
      }
    })
  })

  console.log('✅ Socket.IO server ready')
  return io
}

export function getIO(): SocketIOServer | null {
  return io
}

// Utility functions to emit events

export function emitOrderStatusUpdate(orderId: string, status: string, userId: string) {
  const client = getSocketClient()

  const updateData = {
    orderId,
    status,
    userId,
    timestamp: Date.now(),
  }

  // Send to Socket.IO server to broadcast
  client.emit('server:order_status_update', updateData)
  console.log(`📦 Emitted order update via socket client:`, updateData)
}

export function emitNewService(serviceData: any) {
  const client = getSocketClient()
  client.emit('server:new_service', {
    service: serviceData,
    timestamp: Date.now(),
  })
  console.log('🆕 New service created:', serviceData.title)
}

export function emitServiceUpdate(serviceId: string, updates: any) {
  const client = getSocketClient()
  client.emit('server:service_update', {
    serviceId,
    updates,
    timestamp: Date.now(),
  })
  console.log('🔄 Service updated:', serviceId)
}

export function emitServiceDeleted(serviceId: string) {
  const client = getSocketClient()
  client.emit('server:service_deleted', {
    serviceId,
    timestamp: Date.now(),
  })
  console.log('🗑️ Service deleted:', serviceId)
}

export function emitBidUpdate(serviceId: string, bidData: any) {
  const client = getSocketClient()
  client.emit('server:bid_update', {
    serviceId,
    bid: bidData,
    timestamp: Date.now(),
  })
  console.log('💰 New bid on service:', serviceId)
}

export function emitStockUpdate(serviceId: string, stockQuantity: number) {
  const client = getSocketClient()
  client.emit('server:stock_update', {
    serviceId,
    stockQuantity,
    timestamp: Date.now(),
  })
  console.log(`📊 Stock updated for service ${serviceId}: ${stockQuantity}`)
}

export function notifyUser(userId: string, notification: any) {
  const client = getSocketClient()
  client.emit('server:notify_user', {
    userId,
    notification,
    timestamp: Date.now(),
  })
}

export function broadcastSystemMessage(message: string, type: 'info' | 'warning' | 'error' = 'info') {
  const client = getSocketClient()
  client.emit('server:system_message', {
    message,
    type,
    timestamp: Date.now(),
  })
  console.log(`📢 System message broadcasted: ${message}`)
}
