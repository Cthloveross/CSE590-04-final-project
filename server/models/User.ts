import mongoose from 'mongoose'
import type { UserRole } from '~/types/entities'

const { Schema, model, models } = mongoose
type Document = mongoose.Document

export interface UserDocument extends Document {
  username: string
  email: string
  passwordHash: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<UserDocument>(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
)

export const UserModel = models.User || model<UserDocument>('User', userSchema)
