import { defineEventHandler } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { upsertServiceSchema } from '~/server/schemas/service'
import { connectToDatabase } from '~/server/utils/db'
import { ServiceModel } from '~/server/models/Service'
import { toService } from '~/server/utils/serializers'
import { emitNewService } from '~/server/utils/socket'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await connectToDatabase()
  const payload = await parseBody(event, upsertServiceSchema)
  const servicePayload = {
    gameId: payload.gameId,
    title: payload.title,
    price: payload.price,
    stockQuantity: payload.stockQuantity ?? 10,
    type: payload.type,
    description: payload.description,
    imageUrl: payload.imageUrl,
    isActive: payload.isActive ?? true,
  }
  const created = await ServiceModel.create(servicePayload)
  const service = toService(created)
  
  // Emit Socket.IO event for new service
  emitNewService(service)
  
  return service
})
