import { defineEventHandler, createError } from 'h3'
import { z } from 'zod'
import { requireUser } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { connectToDatabase } from '~/server/utils/db'
import { ServiceModel } from '~/server/models/Service'
import { toService } from '~/server/utils/serializers'

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

  const service = await ServiceModel.findById(serviceId)
  if (!service) {
    throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  }

  // Add stock quantity
  service.stockQuantity += payload.quantity
  await service.save()

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

