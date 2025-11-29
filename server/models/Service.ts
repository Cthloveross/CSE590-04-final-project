import mongoose from 'mongoose'
import type { ServiceType } from '~/types/entities'

const { Schema, model, models, Types } = mongoose
type Document = mongoose.Document

export interface ServiceDocument extends Document {
  gameId: mongoose.Types.ObjectId
  title: string
  price: number
  stockQuantity: number
  type: ServiceType
  description: string
  imageUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const serviceSchema = new Schema<ServiceDocument>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 1 },
    stockQuantity: { type: Number, required: true, default: 10, min: 0 },
    type: { type: String, enum: ['boosting', 'coaching', 'placement', 'companion', 'custom'], default: 'boosting' },
    description: { type: String, required: true },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

serviceSchema.index({ gameId: 1 })
serviceSchema.index({ title: 'text', description: 'text' })

export const ServiceModel = models.Service || model<ServiceDocument>('Service', serviceSchema)
