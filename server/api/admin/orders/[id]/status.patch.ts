import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { adminOrderStatusSchema } from '~/server/schemas/order'
import { connectToDatabase } from '~/server/utils/db'
import { OrderModel } from '~/server/models/Order'
import { toOrder } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await connectToDatabase()
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Order id missing' })
  }

  const payload = await parseBody(event, adminOrderStatusSchema)
  const updated = await OrderModel.findByIdAndUpdate(id, { status: payload.status }, { new: true })
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found' })
  }

  return toOrder(updated)
})
