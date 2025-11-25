import mongoose from 'mongoose'
import type { ServiceType } from '~/types/entities'

const { Schema, model, models, Types } = mongoose
type Document = mongoose.Document

export interface ServiceDocument extends Document {
  gameId: mongoose.Types.ObjectId
  title: string
  startingPrice: number
  currentBid: number
  type: ServiceType
  description: string
  imageUrl?: string
  isActive: boolean
  auctionEndTime: Date
  highestBidder?: mongoose.Types.ObjectId
  bidCount: number
  createdAt: Date
  updatedAt: Date
}

const serviceSchema = new Schema<ServiceDocument>(
  {
    gameId: { type: Schema.Types.ObjectId, ref: 'Game', required: true },
    title: { type: String, required: true },
    startingPrice: { type: Number, required: true, min: 1 },
    currentBid: { type: Number, required: true, min: 1 },
    type: { type: String, enum: ['boosting', 'coaching', 'placement', 'custom'], default: 'boosting' },
    description: { type: String, required: true },
    imageUrl: { type: String },
    isActive: { type: Boolean, default: true },
    auctionEndTime: { type: Date, required: true },
    highestBidder: { type: Schema.Types.ObjectId, ref: 'User' },
    bidCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

serviceSchema.index({ gameId: 1 })
serviceSchema.index({ title: 'text', description: 'text' })

export const ServiceModel = models.Service || model<ServiceDocument>('Service', serviceSchema)
