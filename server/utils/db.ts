import { createError } from 'h3'
import mongoose from 'mongoose'

mongoose.set('strictQuery', true)

const globalState = globalThis as typeof globalThis & {
  _mongooseConn?: Promise<typeof mongoose>
}

export const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose
  }

  if (!globalState._mongooseConn) {
    const config = useRuntimeConfig()
    if (!config.mongodbUri) {
      throw createError({ statusCode: 500, statusMessage: 'Missing MongoDB connection string' })
    }
    globalState._mongooseConn = mongoose.connect(config.mongodbUri)
  }

  return globalState._mongooseConn
}

export const ensureDb = async () => {
  await connectToDatabase()
}
