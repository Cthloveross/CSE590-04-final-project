import { defineEventHandler, createError } from 'h3'
import { loginSchema } from '~/server/schemas/auth'
import { parseBody } from '~/server/utils/validation'
import { connectToDatabase } from '~/server/utils/db'
import { UserModel } from '~/server/models/User'
import { setAuthCookie, verifyPassword } from '~/server/utils/auth'
import { toUserProfile } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  console.log('🔐 Login attempt started')
  await connectToDatabase()
  console.log('✅ Database connected')
  
  const body = await parseBody(event, loginSchema)
  console.log('📧 Login attempt for email:', body.email)

  const user = await UserModel.findOne({ email: body.email })
  console.log('👤 User found:', user ? 'Yes' : 'No')
  
  if (!user) {
    console.log('❌ User not found in database')
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  const valid = await verifyPassword(body.password, user.passwordHash)
  console.log('🔑 Password valid:', valid)
  
  if (!valid) {
    console.log('❌ Invalid password')
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  setAuthCookie(event, user._id.toString(), user.role)
  console.log('✅ Login successful for:', user.email)

  return toUserProfile(user)
})
