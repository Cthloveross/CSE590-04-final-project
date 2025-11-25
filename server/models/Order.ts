import mongoose from 'mongoose'
import type { OrderStatus, ServiceType } from '~/types/entities'

const { Schema, model, models, Types } = mongoose
type Document = mongoose.Document

export interface OrderItemSnapshot {
  serviceId: mongoose.Types.ObjectId
  title: string
  price: number
  quantity: number
  type: ServiceType
  game: {
    _id: mongoose.Types.ObjectId
    slug: string
    name: string
  }
}

export interface OrderDocument extends Document {
  userId: mongoose.Types.ObjectId
  items: OrderItemSnapshot[]
  totalPrice: number
  status: OrderStatus
  instructions: {
    gameHandle: string
    region: string
    scheduleWindow: string
    notes?: string
  }
  createdAt: Date
  updatedAt: Date
}

const orderSchema = new Schema<OrderDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
      type: [
        {
          serviceId: { type: Schema.Types.ObjectId, required: true },
          title: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, required: true },
          type: { type: String, required: true },
          game: {
            _id: { type: Schema.Types.ObjectId, required: true },
            slug: { type: String, required: true },
            name: { type: String, required: true },
          },
        },
      ],
      required: true,
      validate: [(val: OrderItemSnapshot[]) => val.length > 0, 'Order needs at least one item'],
    },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    instructions: {
      gameHandle: { type: String, required: true },
      region: { type: String, required: true },
      scheduleWindow: { type: String, required: true },
      notes: { type: String },
    },
  },
  { timestamps: true }
)

orderSchema.index({ userId: 1, createdAt: -1 })

export const OrderModel = models.Order || model<OrderDocument>('Order', orderSchema)
