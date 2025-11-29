import { defineEventHandler, createError } from 'h3'
import { requireUser } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { checkoutSchema } from '~/server/schemas/order'
import { connectToDatabase } from '~/server/utils/db'
import { CartItemModel } from '~/server/models/CartItem'
import { OrderModel } from '~/server/models/Order'
import { ServiceModel } from '~/server/models/Service'
import { UserModel } from '~/server/models/User'
import { toOrder } from '~/server/utils/serializers'
import { emitStockUpdate } from '~/server/utils/socket'

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
    return {
      serviceId: service._id,
      title: service.title,
      price: service.price ?? 0,
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

  // Check user has sufficient balance
  const userDoc = await UserModel.findById(user._id)
  if (!userDoc) {
    throw createError({ statusCode: 401, statusMessage: 'User not found' })
  }
  if (userDoc.walletBalance < totalPrice) {
    throw createError({ statusCode: 400, statusMessage: `Insufficient balance. You have $${userDoc.walletBalance}, but need $${totalPrice}` })
  }

  // Atomically decrement stock for each service and check availability
  const updatedServices: { serviceId: string; stockQuantity: number }[] = []
  for (const item of orderItems) {
    const result = await ServiceModel.findOneAndUpdate(
      { _id: item.serviceId, stockQuantity: { $gte: item.quantity } },
      { $inc: { stockQuantity: -item.quantity } },
      { new: true }
    )
    if (!result) {
      throw createError({ statusCode: 400, statusMessage: `Not enough stock for "${item.title}". Please refresh and try again.` })
    }
    updatedServices.push({ serviceId: result._id.toString(), stockQuantity: result.stockQuantity })
  }

  // Emit real-time stock updates for all affected services
  for (const { serviceId, stockQuantity } of updatedServices) {
    emitStockUpdate(serviceId, stockQuantity)
  }

  // Deduct wallet balance
  await UserModel.findByIdAndUpdate(user._id, { $inc: { walletBalance: -totalPrice } })

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
