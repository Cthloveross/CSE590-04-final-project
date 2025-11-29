import { defineEventHandler, createError, readBody } from 'h3'
import { connectToDatabase } from '~/server/utils/db'
import { requireAdmin } from '~/server/utils/auth'
import { UserModel } from '~/server/models/User'
import { z } from 'zod'

const updateRoleSchema = z.object({
  role: z.enum(['user', 'seller', 'admin']),
})

export default defineEventHandler(async (event) => {
  // Require admin access
  const admin = await requireAdmin(event)
  
  await connectToDatabase()
  
  const userId = event.context.params?.id
  if (!userId) {
    throw createError({ statusCode: 400, statusMessage: 'User ID required' })
  }

  // Parse and validate body
  const body = await readBody(event)
  const parsed = updateRoleSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Invalid role. Must be user, seller, or admin' 
    })
  }

  // Prevent admin from demoting themselves
  if (userId === admin._id && parsed.data.role !== 'admin') {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Cannot change your own admin role' 
    })
  }

  // Find and update user
  const user = await UserModel.findByIdAndUpdate(
    userId,
    { role: parsed.data.role },
    { new: true }
  ).select('username email role provider avatarUrl walletBalance createdAt updatedAt')

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found' })
  }

  return {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    role: user.role,
    provider: user.provider || 'local',
    avatarUrl: user.avatarUrl,
    walletBalance: user.walletBalance ?? 0,
    createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
    updatedAt: user.updatedAt?.toISOString?.() ?? new Date().toISOString(),
  }
})

