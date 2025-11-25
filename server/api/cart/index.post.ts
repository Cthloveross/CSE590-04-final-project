import { defineEventHandler, createError } from 'h3'
import { requireUser } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { cartItemSchema } from '~/server/schemas/cart'
import { connectToDatabase } from '~/server/utils/db'
import { CartItemModel } from '~/server/models/CartItem'
import { ServiceModel } from '~/server/models/Service'
import { toCartItem } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await connectToDatabase()
  const payload = await parseBody(event, cartItemSchema)

  const service = await ServiceModel.findById(payload.serviceId).populate('gameId')
  if (!service || !service.isActive) {
    throw createError({ statusCode: 404, statusMessage: 'Service unavailable' })
  }

  await CartItemModel.findOneAndUpdate(
    { userId: user._id, serviceId: payload.serviceId },
    { $set: { quantity: payload.quantity, notes: payload.notes } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  const items = await CartItemModel.find({ userId: user._id }).populate({
    path: 'serviceId',
    populate: { path: 'gameId' },
  })

  return items.map((doc) => toCartItem(doc))
})
