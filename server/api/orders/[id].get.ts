import { defineEventHandler, createError } from 'h3'
import { requireUser } from '~/server/utils/auth'
import { connectToDatabase } from '~/server/utils/db'
import { OrderModel } from '~/server/models/Order'
import { toOrder } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await connectToDatabase()
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Order id missing' })
  }

  const order = await OrderModel.findOne({ _id: id, userId: user._id })
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  return toOrder(order)
})
