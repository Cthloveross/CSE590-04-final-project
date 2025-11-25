import { defineEventHandler, createError } from 'h3'
import { ServiceModel } from '~/server/models/Service'
import { connectToDatabase } from '~/server/utils/db'
import { toService } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  await connectToDatabase()
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Service id missing' })
  }

  const service = await ServiceModel.findById(id).populate('gameId')
  if (!service) {
    throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  }

  return toService(service)
})
