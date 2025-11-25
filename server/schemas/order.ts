import { z } from 'zod'

export const checkoutSchema = z.object({
  gameHandle: z.string().min(3).max(50),
  region: z.string().min(2).max(30),
  scheduleWindow: z.string().min(3).max(80),
  notes: z.string().max(500).optional(),
})

export const adminOrderStatusSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
})
