import { defineEventHandler } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { connectToDatabase } from '~/server/utils/db'
import { OrderModel } from '~/server/models/Order'
import { toOrder } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await connectToDatabase()
  const orders = await OrderModel.find().populate('userId').sort({ createdAt: -1 })
  return orders.map((doc) => toOrder(doc))
})
