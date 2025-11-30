import { defineEventHandler, setResponseStatus } from 'h3'
import { getSessionUser } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getSessionUser(event)
  
  // Return 204 No Content when no session exists
  if (!user) {
    setResponseStatus(event, 204)
    return null
  }
  
  return user
})
