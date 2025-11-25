import mongoose from 'mongoose'

const { Schema, model, models } = mongoose
type Document = mongoose.Document

export interface GameDocument extends Document {
  slug: string
  name: string
  iconUrl: string
  description: string
  createdAt: Date
  updatedAt: Date
}

const gameSchema = new Schema<GameDocument>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    iconUrl: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
)

gameSchema.set('toJSON', { virtuals: true })

export const GameModel = models.Game || model<GameDocument>('Game', gameSchema)
