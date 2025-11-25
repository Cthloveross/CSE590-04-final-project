import { defineEventHandler, createError } from 'h3'
import { requireUser } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { checkoutSchema } from '~/server/schemas/order'
import { connectToDatabase } from '~/server/utils/db'
import { CartItemModel } from '~/server/models/CartItem'
import { OrderModel } from '~/server/models/Order'
import { toOrder } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await connectToDatabase()
  const payload = await parseBody(event, checkoutSchema)

  const cartItems = await CartItemModel.find({ userId: user._id }).populate({
    path: 'serviceId',
    populate: { path: 'gameId' },
  })

  if (!cartItems.length) {
    throw createError({ statusCode: 400, statusMessage: 'Your cart is empty' })
  }

  const orderItems = cartItems.map((item) => {
    const service: any = item.serviceId
    if (!service || !service.gameId) {
      throw createError({ statusCode: 400, statusMessage: 'Cart is outdated, please refresh' })
    }
    const unitPrice = service.currentBid ?? service.startingPrice ?? 0
    return {
      serviceId: service._id,
      title: service.title,
      price: unitPrice,
      quantity: item.quantity,
      type: service.type,
      game: {
        _id: service.gameId._id,
        slug: service.gameId.slug,
        name: service.gameId.name,
      },
    }
  })

  const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const order = await OrderModel.create({
    userId: user._id,
    items: orderItems,
    totalPrice,
    status: 'pending',
    instructions: payload,
  })

  await CartItemModel.deleteMany({ userId: user._id })

  return toOrder(order)
})
