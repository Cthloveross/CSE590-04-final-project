import { defineEventHandler } from 'h3'
import { connectToDatabase } from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'
import { UserModel } from '~/server/models/User'

export default defineEventHandler(async (event) => {
  // Require admin access
  await requireAdmin(event)
  
  await connectToDatabase()

  // Get all users with selected fields
  const users = await UserModel.find({})
    .select('username email role provider avatarUrl walletBalance createdAt updatedAt')
    .sort({ createdAt: -1 })
    .lean()

  return users.map((user: any) => ({
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    provider: user.provider || 'local',
    avatarUrl: user.avatarUrl,
    walletBalance: user.walletBalance ?? 0,
    createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  }))
})

