import { defineEventHandler } from 'h3'
import { GameModel } from '~/server/models/Game'
import { connectToDatabase } from '~/server/utils/db'
import { toGame } from '~/server/utils/serializers'

export default defineEventHandler(async () => {
  await connectToDatabase()
  const games = await GameModel.find().sort({ name: 1 })
  return games.map(toGame)
})
