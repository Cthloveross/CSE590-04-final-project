import { defineEventHandler, createError } from 'h3'
import { requireUser } from '~/server/utils/auth'
import { connectToDatabase } from '~/server/utils/db'
import { CartItemModel } from '~/server/models/CartItem'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await connectToDatabase()
  const itemId = event.context.params?.itemId
  if (!itemId) {
    throw createError({ statusCode: 400, statusMessage: 'Cart item id missing' })
  }

  const deleted = await CartItemModel.findOneAndDelete({ _id: itemId, userId: user._id })
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Cart item not found' })
  }

  return { success: true }
})
