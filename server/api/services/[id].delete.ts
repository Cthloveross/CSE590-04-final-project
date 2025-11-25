import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { connectToDatabase } from '~/server/utils/db'
import { ServiceModel } from '~/server/models/Service'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await connectToDatabase()
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Service id missing' })
  }

  const deleted = await ServiceModel.findByIdAndDelete(id)
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  }

  return { success: true }
})
