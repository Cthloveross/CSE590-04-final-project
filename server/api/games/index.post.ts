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

  const exists = await GameModel.findOne({ slug: payload.slug })
  if (exists) {
    throw createError({ statusCode: 409, statusMessage: 'Slug already in use' })
  }

  const created = await GameModel.create(payload)
  return toGame(created)
})
