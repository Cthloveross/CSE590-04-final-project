import mongoose from 'mongoose'

const { Schema, model, models, Types } = mongoose
type Document = mongoose.Document

export interface CartItemDocument extends Document {
  userId: mongoose.Types.ObjectId
  serviceId: mongoose.Types.ObjectId
  quantity: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const cartItemSchema = new Schema<CartItemDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    notes: { type: String },
  },
  { timestamps: true }
)

cartItemSchema.index({ userId: 1, serviceId: 1 }, { unique: true })

export const CartItemModel = models.CartItem || model<CartItemDocument>('CartItem', cartItemSchema)
