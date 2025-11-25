import { defineEventHandler } from 'h3'
import { requireUser } from '~/server/utils/auth'
import { connectToDatabase } from '~/server/utils/db'
import { OrderModel } from '~/server/models/Order'
import { toOrder } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  await connectToDatabase()
  const orders = await OrderModel.find({ userId: user._id }).sort({ createdAt: -1 })
  return orders.map((order) => toOrder(order))
})
