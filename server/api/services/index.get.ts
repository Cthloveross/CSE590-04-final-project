import { defineEventHandler } from 'h3'
import { ServiceModel } from '~/server/models/Service'
import { connectToDatabase } from '~/server/utils/db'
import { toService } from '~/server/utils/serializers'

export default defineEventHandler(async () => {
  await connectToDatabase()
  const services = await ServiceModel.find().populate('gameId').sort({ updatedAt: -1 })
  return services.map((svc) => toService(svc))
})
