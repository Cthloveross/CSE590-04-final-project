import { z } from 'zod'

export const upsertServiceSchema = z.object({
  gameId: z.string().min(3),
  title: z.string().min(3).max(120),
  price: z.number().positive(),
  stockQuantity: z.number().int().nonnegative().optional().default(10),
  type: z.enum(['boosting', 'coaching', 'placement', 'companion', 'custom']),
  description: z.string().min(10).max(1000),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional().default(true),
})
