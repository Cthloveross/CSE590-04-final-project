import { z } from 'zod'

export const upsertServiceSchema = z.object({
  gameId: z.string().min(3),
  title: z.string().min(3).max(120),
  price: z.number().positive(),
  startingPrice: z.number().positive().optional(),
  currentBid: z.number().positive().optional(),
  auctionEndTime: z.string().datetime().optional(),
  bidCount: z.number().int().nonnegative().optional(),
  type: z.enum(['boosting', 'coaching', 'placement', 'custom']),
  description: z.string().min(10).max(1000),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional().default(true),
})
