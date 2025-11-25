import { createError, H3Event, readBody } from 'h3'
import { z } from 'zod'

export const parseBody = async <T extends z.ZodTypeAny>(event: H3Event, schema: T): Promise<z.infer<T>> => {
  const body = await readBody(event)
  const result = schema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: result.error.message })
  }
  return result.data
}
