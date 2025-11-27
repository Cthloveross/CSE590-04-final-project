import type { CartItem, Game, Order, Service, UserProfile } from '~/types/entities'
import type { CartItemDocument } from '../models/CartItem'
import type { GameDocument } from '../models/Game'
import type { OrderDocument } from '../models/Order'
import type { ServiceDocument } from '../models/Service'
import type { UserDocument } from '../models/User'

const toTimestamp = (value?: Date) => value?.toISOString?.() ?? new Date().toISOString()

export const toUserProfile = (doc: UserDocument): UserProfile => ({
  _id: doc._id.toString(),
  username: doc.username,
  email: doc.email,
  role: doc.role,
  provider: doc.provider,
  avatarUrl: doc.avatarUrl,
  walletBalance: doc.walletBalance ?? 1000,
  createdAt: toTimestamp(doc.createdAt),
  updatedAt: toTimestamp(doc.updatedAt),
})

export const toGame = (doc: GameDocument): Game => ({
  _id: doc._id.toString(),
  slug: doc.slug,
  name: doc.name,
  iconUrl: doc.iconUrl,
  description: doc.description,
  createdAt: toTimestamp(doc.createdAt),
  updatedAt: toTimestamp(doc.updatedAt),
})

export const toService = (doc: ServiceDocument & { gameId?: GameDocument }): Service => ({
  _id: doc._id.toString(),
  gameId: doc.gameId.toString(),
  game: doc.gameId && 'slug' in doc.gameId ? toGame(doc.gameId as GameDocument) : undefined,
  title: doc.title,
  price: doc.price,
  stockQuantity: doc.stockQuantity,
  type: doc.type as Service['type'],
  description: doc.description,
  imageUrl: doc.imageUrl,
  isActive: doc.isActive,
  createdAt: toTimestamp(doc.createdAt),
  updatedAt: toTimestamp(doc.updatedAt),
})

export const toCartItem = (
  doc: CartItemDocument & { serviceId?: ServiceDocument & { gameId?: GameDocument } }
): CartItem => ({
  _id: doc._id.toString(),
  userId: doc.userId.toString(),
  serviceId: doc.serviceId.toString(),
  quantity: doc.quantity,
  notes: doc.notes,
  createdAt: toTimestamp(doc.createdAt),
  updatedAt: toTimestamp(doc.updatedAt),
  service:
    doc.serviceId && 'title' in doc.serviceId
      ? toService(doc.serviceId as ServiceDocument & { gameId?: GameDocument })
      : undefined,
})

export const toOrder = (doc: OrderDocument & { userId?: UserDocument }): Order => ({
  _id: doc._id.toString(),
  userId: doc.userId.toString(),
  user: doc.userId && 'email' in doc.userId ? toUserProfile(doc.userId as UserDocument) : undefined,
  items: doc.items.map((item) => ({
    serviceId: item.serviceId.toString(),
    title: item.title,
    price: item.price,
    quantity: item.quantity,
    type: item.type,
    game: {
      _id: item.game._id.toString(),
      slug: item.game.slug,
      name: item.game.name,
    },
  })),
  instructions: {
    gameHandle: doc.instructions.gameHandle,
    region: doc.instructions.region,
    scheduleWindow: doc.instructions.scheduleWindow,
    notes: doc.instructions.notes,
  },
  totalPrice: doc.totalPrice,
  status: doc.status,
  createdAt: toTimestamp(doc.createdAt),
  updatedAt: toTimestamp(doc.updatedAt),
})
