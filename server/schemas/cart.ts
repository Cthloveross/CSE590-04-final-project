import { z } from 'zod'

export const cartItemSchema = z.object({
  serviceId: z.string().min(10),
  quantity: z.number().int().min(1).max(25).default(1),
  notes: z.string().max(280).optional(),
})

export const cartUpdateSchema = z.object({
  quantity: z.number().int().min(1).max(25).optional(),
  notes: z.string().max(280).optional(),
})
