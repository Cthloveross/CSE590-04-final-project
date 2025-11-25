import { defineEventHandler } from 'h3'
import { requireUser } from '~/server/utils/auth'
import { connectToDatabase } from '~/server/utils/db'
import { CartItemModel } from '~/server/models/CartItem'
import { toCartItem } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await connectToDatabase()
  const items = await CartItemModel.find({ userId: user._id })
    .populate({
      path: 'serviceId',
      populate: { path: 'gameId' },
    })
    .sort({ updatedAt: -1 })

  return items.map((doc) => toCartItem(doc))
})
