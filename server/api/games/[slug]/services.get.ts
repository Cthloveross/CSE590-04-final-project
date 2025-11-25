import { defineEventHandler, createError } from 'h3'
import { GameModel } from '~/server/models/Game'
import { ServiceModel } from '~/server/models/Service'
import { connectToDatabase } from '~/server/utils/db'
import { toService } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  await connectToDatabase()
  const slug = event.context.params?.slug
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Game slug missing' })
  }

  const game = await GameModel.findOne({ slug })
  if (!game) {
    throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  }

  const services = await ServiceModel.find({ gameId: game._id, isActive: true }).sort({ currentBid: 1 })
  return services.map(toService)
})
