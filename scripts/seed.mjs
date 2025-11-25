#!/usr/bin/env node
/**
 * Database seed script
 * Populates MongoDB with sample games, services, and an admin user
 * Usage: node scripts/seed.mjs
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// Load environment from .env
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = join(__dirname, '../.env')

try {
  const envFile = readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const [key, ...values] = line.split('=')
    if (key && values.length) {
      process.env[key.trim()] = values.join('=').trim()
    }
  })
} catch (err) {
  console.warn('⚠️  No .env file found, using defaults')
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/game-shop'

// Schema definitions
const { Schema } = mongoose

const UserSchema = new Schema({
  username: String,
  email: String,
  passwordHash: String,
  role: String,
}, { timestamps: true })

const GameSchema = new Schema({
  slug: String,
  name: String,
  iconUrl: String,
  description: String,
}, { timestamps: true })

const ServiceSchema = new Schema({
  gameId: { type: Schema.Types.ObjectId, ref: 'Game' },
  title: String,
  startingPrice: Number,
  currentBid: Number,
  auctionEndTime: Date,
  highestBidder: { type: Schema.Types.ObjectId, ref: 'User' },
  bidCount: Number,
  type: String,
  description: String,
  imageUrl: String,
  isActive: Boolean,
}, { timestamps: true })

const User = mongoose.models.User || mongoose.model('User', UserSchema)
const Game = mongoose.models.Game || mongoose.model('Game', GameSchema)
const Service = mongoose.models.Service || mongoose.model('Service', ServiceSchema)

const sampleGames = [
  {
    slug: 'cs2',
    name: 'Counter-Strike 2',
    iconUrl: 'https://via.placeholder.com/150/FF5722/ffffff?text=CS2',
    description: 'Tactical FPS with competitive ranked mode.',
  },
  {
    slug: 'valorant',
    name: 'Valorant',
    iconUrl: 'https://via.placeholder.com/150/FF4655/ffffff?text=VAL',
    description: 'Character-based tactical shooter from Riot Games.',
  },
  {
    slug: 'lol',
    name: 'League of Legends',
    iconUrl: 'https://via.placeholder.com/150/0AC8B9/ffffff?text=LoL',
    description: 'MOBA with ranked ladder and seasonal rewards.',
  },
  {
    slug: 'apex',
    name: 'Apex Legends',
    iconUrl: 'https://via.placeholder.com/150/CD3333/ffffff?text=APEX',
    description: 'Battle royale with hero abilities and fast-paced action.',
  },
]

const sampleServicesPerGame = [
  {
    title: '30 Level Boost - Bronze to Silver',
    startingPrice: 50,
    currentBid: 50,
    type: 'boosting',
    description: 'Professional booster will level up your account by 30 levels. Estimated completion: 3-5 days.',
    bidCount: 0,
  },
  {
    title: '50 Level Boost - Silver to Gold',
    startingPrice: 80,
    currentBid: 80,
    type: 'boosting',
    description: 'Guaranteed rank increase from Silver to Gold with win-rate tracking. Fast delivery.',
    bidCount: 0,
  },
  {
    title: '2-Hour Premium Coaching Session',
    startingPrice: 40,
    currentBid: 40,
    type: 'coaching',
    description: 'Live 1-on-1 coaching from pro players with VOD review, tactical advice, and personalized training plan.',
    bidCount: 0,
  },
  {
    title: 'Full Season Placement Matches (10 games)',
    startingPrice: 90,
    currentBid: 90,
    type: 'placement',
    description: 'Expert players will complete your placement matches to get you the best possible starting rank.',
    bidCount: 0,
  },
  {
    title: 'Weekend Rank Grind Package',
    startingPrice: 150,
    currentBid: 150,
    type: 'custom',
    description: 'Unlimited boosting hours during the weekend (Fri-Sun) to maximize your rank gains.',
    bidCount: 0,
  },
]

async function seed() {
  console.log('🌱 Starting database seed...\n')

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    // Clear existing data
    console.log('🗑️  Clearing existing data...')
    await User.deleteMany({})
    await Game.deleteMany({})
    await Service.deleteMany({})
    console.log('✅ Cleared collections\n')

    // Create admin user
    console.log('👤 Creating admin user...')
    const adminPasswordHash = await bcrypt.hash('admin12345', 12)
    const admin = await User.create({
      username: 'Admin',
      email: 'admin@example.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
    })
    console.log(`✅ Admin user created: ${admin.email} / admin12345\n`)

    // Create regular user
    console.log('👤 Creating test user...')
    const userPasswordHash = await bcrypt.hash('user12345', 12)
    const user = await User.create({
      username: 'TestUser',
      email: 'user@example.com',
      passwordHash: userPasswordHash,
      role: 'user',
    })
    console.log(`✅ Test user created: ${user.email} / user12345\n`)

    // Create games and services
    console.log('🎮 Creating games and auction services...')
    for (const gameData of sampleGames) {
      const game = await Game.create(gameData)
      console.log(`  ✓ ${game.name}`)

      // Create auction services for this game
      for (const serviceData of sampleServicesPerGame) {
        // Set auction end time to 7 days from now
        const auctionEndTime = new Date()
        auctionEndTime.setDate(auctionEndTime.getDate() + 7)
        
        await Service.create({
          ...serviceData,
          gameId: game._id,
          isActive: true,
          auctionEndTime,
        })
      }
    }
    console.log(`✅ Created ${sampleGames.length} games with ${sampleServicesPerGame.length} services each\n`)

    console.log(`✅ Created ${sampleGames.length} games with ${sampleServicesPerGame.length} auction services each\n`)

    console.log('✅ Seed completed successfully!\n')
    console.log('📋 Summary:')
    console.log(`  - Admin: admin@example.com / admin12345`)
    console.log(`  - User:  user@example.com / user12345`)
    console.log(`  - Games: ${sampleGames.length}`)
    console.log(`  - Auction Services: ${sampleGames.length * sampleServicesPerGame.length}`)
    console.log(`  - Auction Duration: 7 days from now`)
    console.log('\n🚀 Run `npm run dev` and visit http://localhost:3000')
    console.log('💰 Users can now bid on services - highest bidder wins!')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

seed()
