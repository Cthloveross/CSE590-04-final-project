import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { upsertServiceSchema } from '~/server/schemas/service'
import { connectToDatabase } from '~/server/utils/db'
import { ServiceModel } from '~/server/models/Service'
import { toService } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await connectToDatabase()
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Service id missing' })
  }

  const payload = await parseBody(event, upsertServiceSchema)
  const update: Record<string, any> = {
    gameId: payload.gameId,
    title: payload.title,
    type: payload.type,
    description: payload.description,
    imageUrl: payload.imageUrl,
    isActive: payload.isActive ?? true,
  }

  if (payload.bidCount !== undefined) {
    update.bidCount = payload.bidCount
  }

  if (payload.startingPrice !== undefined || payload.price !== undefined) {
    update.startingPrice = payload.startingPrice ?? payload.price
  }

  if (payload.currentBid !== undefined || payload.price !== undefined) {
    update.currentBid = payload.currentBid ?? payload.price
  }

  if (payload.auctionEndTime) {
    update.auctionEndTime = new Date(payload.auctionEndTime)
  }

  const updated = await ServiceModel.findByIdAndUpdate(id, update, { new: true })
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  }

  return toService(updated)
})
