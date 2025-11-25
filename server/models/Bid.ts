import mongoose from 'mongoose'

const { Schema, model, models } = mongoose
type Document = mongoose.Document

export interface BidDocument extends Document {
  serviceId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  bidAmount: number
  timestamp: Date
  createdAt: Date
  updatedAt: Date
}

const bidSchema = new Schema<BidDocument>(
  {
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bidAmount: { type: Number, required: true, min: 1 },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

bidSchema.index({ serviceId: 1, createdAt: -1 })
bidSchema.index({ userId: 1, createdAt: -1 })

export const BidModel = models.Bid || model<BidDocument>('Bid', bidSchema)
