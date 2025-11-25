import { z } from 'zod'

export const registerSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(64),
  confirmPassword: z.string().min(8).max(64),
})

export const loginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(64),
})
