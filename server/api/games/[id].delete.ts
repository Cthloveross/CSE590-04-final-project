import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { connectToDatabase } from '~/server/utils/db'
import { GameModel } from '~/server/models/Game'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await connectToDatabase()
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Game id missing' })
  }

  const deleted = await GameModel.findByIdAndDelete(id)
  if (!deleted) {
    throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  }

  return { success: true }
})
