import { defineEventHandler, createError } from 'h3'
import { requireAdmin } from '~/server/utils/auth'
import { parseBody } from '~/server/utils/validation'
import { upsertGameSchema } from '~/server/schemas/game'
import { connectToDatabase } from '~/server/utils/db'
import { GameModel } from '~/server/models/Game'
import { toGame } from '~/server/utils/serializers'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await connectToDatabase()
  const payload = await parseBody(event, upsertGameSchema)
  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Game id missing' })
  }

  const updated = await GameModel.findByIdAndUpdate(id, payload, { new: true })
  if (!updated) {
    throw createError({ statusCode: 404, statusMessage: 'Game not found' })
  }

  return toGame(updated)
})
