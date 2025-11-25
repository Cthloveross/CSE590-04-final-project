import { z } from 'zod'

export const upsertGameSchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9-]+$/i, 'Slug may only contain letters, numbers, hyphen'),
  name: z.string().min(2).max(64),
  iconUrl: z.string().url(),
  description: z.string().min(10).max(500),
})
