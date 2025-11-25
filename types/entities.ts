export type UserRole = 'user' | 'admin'

export interface BaseEntity {
  _id: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile extends BaseEntity {
  username: string
  email: string
  role: UserRole
}

export interface Game extends BaseEntity {
  slug: string
  name: string
  iconUrl: string
  description: string
}

export type ServiceType = 'boosting' | 'coaching' | 'placement' | 'custom'

export interface Service extends BaseEntity {
  gameId: string
  game?: Pick<Game, '_id' | 'slug' | 'name' | 'iconUrl'>
  title: string
  price: number
  startingPrice: number
  currentBid: number
  auctionEndTime: string
  highestBidder?: string
  bidCount: number
  type: ServiceType
  description: string
  imageUrl?: string
  isActive: boolean
}

export interface CartItem extends BaseEntity {
  userId: string
  serviceId: string
  quantity: number
  notes?: string
  service?: Service
}

export type OrderStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export interface OrderInstructions {
  gameHandle: string
  region: string
  scheduleWindow: string
  notes?: string
}

export interface OrderItemSnapshot {
  serviceId: string
  title: string
  price: number
  quantity: number
  type: ServiceType
  game: Pick<Game, '_id' | 'slug' | 'name'>
}

export interface Order extends BaseEntity {
  userId: string
  user?: Pick<UserProfile, '_id' | 'username' | 'email'>
  items: OrderItemSnapshot[]
  totalPrice: number
  status: OrderStatus
  instructions: OrderInstructions
}
