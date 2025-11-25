import { defineEventHandler } from 'h3'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  return getSessionUser(event)
})
