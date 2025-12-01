import { defineEventHandler, createError } from 'h3'
import { z } from 'zod'
import { requireUser } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { connectToDatabase } from '~/server/utils/db'
import { ServiceModel } from '~/server/models/Service'
import { toService } from '~/server/utils/serializers'
import { emitStockUpdate } from '~/server/utils/socket'

const addStockSchema = z.object({
  quantity: z.number().int().positive().max(100),
  notes: z.string().max(500).optional(),
  timeSlots: z.array(z.string()).optional(),
})

export default defineEventHandler(async (event) => {
  // Require seller or admin role
  const user = await requireUser(event)
  if (user.role !== 'seller' && user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Seller access required' })
  }

  const serviceId = event.context.params?.id
  if (!serviceId) {
    throw createError({ statusCode: 400, statusMessage: 'Service ID required' })
  }

  await connectToDatabase()

  const payload = await parseBody(event, addStockSchema)

  // ATOMIC: Use findOneAndUpdate with $inc to prevent race conditions
  // This ensures concurrent requests don't cause lost updates
  const service = await ServiceModel.findOneAndUpdate(
    { _id: serviceId },
    { $inc: { stockQuantity: payload.quantity } },
    { new: true }
  ).populate('gameId')

  if (!service) {
    throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  }

  // Emit real-time stock update
  emitStockUpdate(serviceId, service.stockQuantity)

  // In a real app, you'd also store the provider's availability details
  // For demo purposes, we just increment the stock

  console.log(`📦 Stock added to "${service.title}":`, {
    quantity: payload.quantity,
    notes: payload.notes,
    timeSlots: payload.timeSlots,
    newTotal: service.stockQuantity,
  })

  return toService(service)
})

