import { defineEventHandler, createError } from 'h3'
import { registerSchema } from '~/server/schemas/auth'
import { parseBody } from '~/server/utils/validation'
import { connectToDatabase } from '~/server/utils/db'
import { UserModel } from '~/server/models/User'
import { hashPassword, setAuthCookie } from '~/server/utils/auth'
import { toUserProfile } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  await connectToDatabase()
  const body = await parseBody(event, registerSchema)

  if (body.password !== body.confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Passwords do not match' })
  }

  const existing = await UserModel.findOne({ email: body.email })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' })
  }

  const passwordHash = await hashPassword(body.password)
  const user = await UserModel.create({
    username: body.username,
    email: body.email,
    passwordHash,
  })

  setAuthCookie(event, user._id.toString(), user.role)

  return toUserProfile(user)
})
