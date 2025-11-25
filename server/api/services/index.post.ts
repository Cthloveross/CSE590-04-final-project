import { defineEventHandler } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { upsertServiceSchema } from '~/server/schemas/service'
import { connectToDatabase } from '~/server/utils/db'
import { ServiceModel } from '~/server/models/Service'
import { toService } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await connectToDatabase()
  const payload = await parseBody(event, upsertServiceSchema)
  const now = new Date()
  const defaultEnd = payload.auctionEndTime ? new Date(payload.auctionEndTime) : new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const servicePayload = {
    gameId: payload.gameId,
    title: payload.title,
    startingPrice: payload.startingPrice ?? payload.price,
    currentBid: payload.currentBid ?? payload.price,
    auctionEndTime: defaultEnd,
    bidCount: payload.bidCount ?? 0,
    type: payload.type,
    description: payload.description,
    imageUrl: payload.imageUrl,
    isActive: payload.isActive ?? true,
  }
  const created = await ServiceModel.create(servicePayload)
  return toService(created)
})
