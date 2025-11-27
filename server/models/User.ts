import mongoose from 'mongoose'
import type { UserRole, AuthProvider } from '~/types/entities'

const { Schema, model, models } = mongoose
type Document = mongoose.Document

export interface UserDocument extends Document {
  username: string
  email: string
  passwordHash?: string
  role: UserRole
  provider: AuthProvider
  providerId?: string
  avatarUrl?: string
  walletBalance: number
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: false },
    role: { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },
    provider: { type: String, enum: ['local', 'google', 'github'], default: 'local' },
    providerId: { type: String, required: false },
    avatarUrl: { type: String, required: false },
    walletBalance: { type: Number, default: 1000, min: 0 },
  },
  { timestamps: true }
)

// Index for OAuth lookups
userSchema.index({ provider: 1, providerId: 1 })

export const UserModel = models.User || model<UserDocument>('User', userSchema)
