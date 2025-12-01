import { createError, deleteCookie, getCookie, getRequestHost, H3Event, setCookie } from 'h3'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

import type { UserProfile } from '~/types/entities'
import { UserModel } from '../models/User'
import { connectToDatabase } from './db'

const TOKEN_COOKIE = 'gss_token'

interface TokenPayload {
  sub: string
  role: string
}

export const hashUserPassword = (password: string) => bcrypt.hash(password, 12)

export const verifyUserPassword = (password: string, hash: string) => bcrypt.compare(password, hash)

const signJwt = (payload: TokenPayload, expiresIn: string) => {
  const config = useRuntimeConfig()
  if (!config.jwtSecret) {
    throw createError({ statusCode: 500, statusMessage: 'JWT secret missing' })
  }
  return jwt.sign(payload, config.jwtSecret, { expiresIn })
}

export const setAuthCookie = (event: H3Event, userId: string, role: string) => {
  const config = useRuntimeConfig()
  const expiresIn = config.jwtExpiresIn || '7d'
  const token = signJwt({ sub: userId, role }, expiresIn)

  // Check if we're on localhost (for development/K8s local testing)
  const host = getRequestHost(event) || ''
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1')

  setCookie(event, TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    // Don't set secure on localhost (even in production mode) for Safari compatibility
    secure: !isLocalhost && process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export const clearAuthCookie = (event: H3Event) => {
  deleteCookie(event, TOKEN_COOKIE, { path: '/' })
}

const decodeToken = (event: H3Event) => {
  const token = getCookie(event, TOKEN_COOKIE)
  if (!token) return null
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtSecret) as TokenPayload
  } catch {
    return null
  }
}

export const getSessionUser = async (event: H3Event): Promise<UserProfile | null> => {
  await connectToDatabase()
  const payload = decodeToken(event)
  if (!payload) return null
  const userDoc = await UserModel.findById(payload.sub)
  if (!userDoc) return null
  return serializeUser(userDoc)
}

export const requireUser = async (event: H3Event): Promise<UserProfile> => {
  const user = await getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required' })
  }
  return user
}

export const requireAdmin = async (event: H3Event): Promise<UserProfile> => {
  const user = await requireUser(event)
  if (user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }
  return user
}

export const serializeUser = (doc: any): UserProfile => ({
  _id: doc._id.toString(),
  username: doc.username,
  email: doc.email,
  role: doc.role,
  provider: doc.provider || 'local',
  avatarUrl: doc.avatarUrl,
  walletBalance: doc.walletBalance ?? 1000,
  createdAt: doc.createdAt?.toISOString?.() ?? new Date().toISOString(),
  updatedAt: doc.updatedAt?.toISOString?.() ?? new Date().toISOString(),
})
