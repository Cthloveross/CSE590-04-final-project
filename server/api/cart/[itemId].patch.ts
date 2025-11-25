import { defineEventHandler, createError } from 'h3'
import { requireUser } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { cartUpdateSchema } from '~/server/schemas/cart'
import { connectToDatabase } from '~/server/utils/db'
import { CartItemModel } from '~/server/models/CartItem'
import { toCartItem } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await connectToDatabase()
  const itemId = event.context.params?.itemId
  if (!itemId) {
    throw createError({ statusCode: 400, statusMessage: 'Cart item id missing' })
  }
  const payload = await parseBody(event, cartUpdateSchema)

  const updated = await CartItemModel.findOneAndUpdate({ _id: itemId, userId: user._id }, payload, { new: true })
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Cart item not found' })
  }

  return toCartItem(updated)
})
