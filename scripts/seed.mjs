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

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not set in .env file')
  console.log('Please set MONGODB_URI in your .env file to your MongoDB Atlas connection string')
  process.exit(1)
}

// Schema definitions
const { Schema } = mongoose

const UserSchema = new Schema({
  username: String,
  email: String,
  passwordHash: String,
  role: String,
  walletBalance: { type: Number, default: 1000 },
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
  price: Number,
  stockQuantity: { type: Number, default: 10 },
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
    iconUrl: '/images/cs2.png',
    description: 'Tactical FPS with competitive ranked mode.',
  },
  {
    slug: 'valorant',
    name: 'Valorant',
    iconUrl: '/images/valorant.jpg',
    description: 'Character-based tactical shooter from Riot Games.',
  },
  {
    slug: 'lol',
    name: 'League of Legends',
    iconUrl: '/images/lol.jpg',
    description: 'MOBA with ranked ladder and seasonal rewards.',
  },
  {
    slug: 'apex',
    name: 'Apex Legends',
    iconUrl: '/images/apex.png',
    description: 'Battle royale with hero abilities and fast-paced action.',
  },
]

// Game-specific services
const cs2Services = [
  {
    title: 'Premier Rating Boost (+1000 Rating)',
    price: 45,
    stockQuantity: 20,
    type: 'boosting',
    description: 'Increase your CS2 Premier rating by 1000 points. Our Global Elite boosters maintain 80%+ win rate.',
  },
  {
    title: 'Premier Rating Boost (+3000 Rating)',
    price: 120,
    stockQuantity: 12,
    type: 'boosting',
    description: 'Major rating push! Jump 3000+ Premier rating with our top-tier players. Ideal for rank-up goals.',
  },
  {
    title: 'FaceIt Level Boost (1-5)',
    price: 75,
    stockQuantity: 8,
    type: 'boosting',
    description: 'Get boosted from Level 1-5 on FaceIt. Our boosters average 2500+ ELO with verified accounts.',
  },
  {
    title: '5-Hour Coaching Marathon',
    price: 85,
    stockQuantity: 15,
    type: 'coaching',
    description: 'Intensive 5-hour session covering aim training, spray patterns, utility usage, and map callouts. Includes replay review.',
  },
  {
    title: '2-Hour Premium Coaching',
    price: 40,
    stockQuantity: 25,
    type: 'coaching',
    description: 'Live 1-on-1 coaching from Global Elite players. VOD review, positioning tips, and economy management.',
  },
  {
    title: 'Wingman Rank Boost',
    price: 35,
    stockQuantity: 18,
    type: 'boosting',
    description: 'Boost your Wingman rank! 2v2 specialists will carry you to your desired rank quickly.',
  },
  {
    title: 'Duo Queue Companion (5 Games)',
    price: 55,
    stockQuantity: 22,
    type: 'companion',
    description: 'Play alongside a skilled teammate! Our companion will help you win while you learn and keep your account.',
  },
  {
    title: 'Placement Matches (10 Games)',
    price: 80,
    stockQuantity: 10,
    type: 'placement',
    description: 'Start your competitive season right. We complete all 10 placement matches for optimal initial rating.',
  },
]

const valorantServices = [
  {
    title: 'Radiant Coaching Session (3 Hours)',
    price: 70,
    stockQuantity: 12,
    type: 'coaching',
    description: 'Learn from Radiant-ranked coaches. Agent selection, crosshair placement, ability usage, and game sense.',
  },
  {
    title: 'Division Boost (Iron to Bronze)',
    price: 30,
    stockQuantity: 25,
    type: 'boosting',
    description: 'Escape Iron! Our Immortal+ boosters will get you to Bronze with high win rates.',
  },
  {
    title: 'Division Boost (Gold to Platinum)',
    price: 65,
    stockQuantity: 15,
    type: 'boosting',
    description: 'Break through the Gold ceiling! Reach Platinum with our experienced Radiant boosters.',
  },
  {
    title: 'Diamond to Ascendant Push',
    price: 150,
    stockQuantity: 6,
    type: 'boosting',
    description: 'Elite tier boost! Climb from Diamond to Ascendant with our top 500 players.',
  },
  {
    title: 'Agent Mastery Coaching',
    price: 45,
    stockQuantity: 20,
    type: 'coaching',
    description: 'Master any agent! 2-hour deep dive into lineups, abilities, and agent-specific strategies.',
  },
  {
    title: 'Duo Queue Partner (3 Games)',
    price: 40,
    stockQuantity: 30,
    type: 'companion',
    description: 'Queue with a skilled partner who communicates and supports your playstyle. Great for learning!',
  },
  {
    title: 'Act Placement Games',
    price: 55,
    stockQuantity: 18,
    type: 'placement',
    description: 'Start each Act strong! We handle your 5 placement games to maximize your starting rank.',
  },
  {
    title: 'Premier Tournament Prep',
    price: 200,
    stockQuantity: 4,
    type: 'custom',
    description: 'Full team coaching and strategy prep for Premier tournaments. Includes 5 hours of scrims review.',
  },
]

const lolServices = [
  {
    title: 'Iron to Silver Boost',
    price: 40,
    stockQuantity: 22,
    type: 'boosting',
    description: 'Escape low ELO! Our Challenger boosters will carry you from Iron to Silver division.',
  },
  {
    title: 'Gold to Platinum Climb',
    price: 85,
    stockQuantity: 14,
    type: 'boosting',
    description: 'Break the Gold barrier! Professional boosting to Platinum with 75%+ win rate guaranteed.',
  },
  {
    title: 'Diamond+ Elite Boost',
    price: 180,
    stockQuantity: 5,
    type: 'boosting',
    description: 'High ELO boosting by Grandmaster/Challenger players. Reach Diamond, Master, or higher!',
  },
  {
    title: 'Role-Specific Coaching (2 Hours)',
    price: 50,
    stockQuantity: 18,
    type: 'coaching',
    description: 'Master your role! In-depth coaching for Top, Jungle, Mid, ADC, or Support by role specialists.',
  },
  {
    title: '5-Hour Coaching Package',
    price: 110,
    stockQuantity: 10,
    type: 'coaching',
    description: 'Comprehensive coaching covering macro, micro, champion pool, and ranked mindset. Best value!',
  },
  {
    title: 'Duo Queue Partner (5 Games)',
    price: 60,
    stockQuantity: 25,
    type: 'companion',
    description: 'Play with a Diamond+ duo partner! Learn while winning with voice comms and live tips.',
  },
  {
    title: 'Placement Games (10 Matches)',
    price: 70,
    stockQuantity: 15,
    type: 'placement',
    description: 'Maximize your starting rank! Our boosters complete placements with high win rates.',
  },
  {
    title: 'Clash Team Coaching',
    price: 120,
    stockQuantity: 6,
    type: 'custom',
    description: 'Full team coaching for Clash tournaments. Draft strategy, team comps, and communication.',
  },
  {
    title: 'TFT Rank Boost',
    price: 55,
    stockQuantity: 12,
    type: 'boosting',
    description: 'Teamfight Tactics boosting by Challenger TFT players. Climb the ranked ladder fast!',
  },
]

const apexServices = [
  {
    title: 'Bronze to Gold RP Boost',
    price: 50,
    stockQuantity: 20,
    type: 'boosting',
    description: 'Climb from Bronze to Gold rank! Our Predator boosters deliver fast results with high KD.',
  },
  {
    title: 'Platinum to Diamond Push',
    price: 100,
    stockQuantity: 10,
    type: 'boosting',
    description: 'Break into Diamond! Skilled boosters who know ranked rotations and fight timing.',
  },
  {
    title: 'Masters/Predator Grind',
    price: 250,
    stockQuantity: 3,
    type: 'boosting',
    description: 'Elite tier boosting to Masters or Predator rank. Top 500 players only. Premium service.',
  },
  {
    title: 'Legend Mastery Coaching',
    price: 45,
    stockQuantity: 18,
    type: 'coaching',
    description: 'Master any Legend! Learn abilities, positioning, and legend-specific strategies in 2 hours.',
  },
  {
    title: '5-Hour BR Coaching Bootcamp',
    price: 95,
    stockQuantity: 8,
    type: 'coaching',
    description: 'Intensive battle royale training: drop spots, looting, rotations, team fights, and endgame.',
  },
  {
    title: 'Trios Companion (5 Games)',
    price: 65,
    stockQuantity: 15,
    type: 'companion',
    description: 'Play with 2 skilled teammates! Learn callouts and team strategies while ranking up.',
  },
  {
    title: 'Duos Partner (3 Games)',
    price: 35,
    stockQuantity: 28,
    type: 'companion',
    description: 'Queue duos with a Predator player. Great for learning positioning and 2v3 clutches.',
  },
  {
    title: '4K Damage Badge Service',
    price: 80,
    stockQuantity: 6,
    type: 'custom',
    description: 'Unlock the prestigious 4K damage badge on any legend. Played by our highest skilled players.',
  },
  {
    title: '20 Kill Badge Service',
    price: 120,
    stockQuantity: 4,
    type: 'custom',
    description: 'Get the coveted 20 bomb badge! Our pro players will unlock this achievement for you.',
  },
  {
    title: 'Arena Rank Boost',
    price: 40,
    stockQuantity: 16,
    type: 'boosting',
    description: 'Climb Arenas ranked mode quickly with our dedicated Arenas specialists.',
  },
]

// Map game slugs to their specific services
const gameServicesMap = {
  'cs2': cs2Services,
  'valorant': valorantServices,
  'lol': lolServices,
  'apex': apexServices,
}

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
      walletBalance: 1000,
    })
    console.log(`✅ Admin user created: ${admin.email} / admin12345 (Balance: $1000)\n`)

    // Create regular user
    console.log('👤 Creating test user...')
    const userPasswordHash = await bcrypt.hash('user12345', 12)
    const user = await User.create({
      username: 'TestUser',
      email: 'user@example.com',
      passwordHash: userPasswordHash,
      role: 'user',
      walletBalance: 1000,
    })
    console.log(`✅ Test user created: ${user.email} / user12345 (Balance: $1000)\n`)

    // Create games and services
    console.log('🎮 Creating games and services...')
    let totalServices = 0
    for (const gameData of sampleGames) {
      const game = await Game.create(gameData)
      const gameServices = gameServicesMap[gameData.slug] || []
      console.log(`  ✓ ${game.name} (${gameServices.length} services)`)

      // Create game-specific services
      for (const serviceData of gameServices) {
        await Service.create({
          ...serviceData,
          gameId: game._id,
          isActive: true,
        })
        totalServices++
      }
    }
    console.log(`✅ Created ${sampleGames.length} games with ${totalServices} total services\n`)

    console.log('✅ Seed completed successfully!\n')
    console.log('📋 Summary:')
    console.log(`  - Admin: admin@example.com / admin12345 ($1000)`)
    console.log(`  - User:  user@example.com / user12345 ($1000)`)
    console.log(`  - Games: ${sampleGames.length}`)
    console.log(`  - Services: ${totalServices} unique services across all games`)
    console.log('    • CS2: 8 services (Premier, FaceIt, Wingman, Coaching, Duo Queue)')
    console.log('    • Valorant: 8 services (Division Boosts, Agent Coaching, Premier Prep)')
    console.log('    • LoL: 9 services (Rank Boosts, Role Coaching, TFT, Clash)')
    console.log('    • Apex: 10 services (RP Boosts, Badge Services, Legend Coaching)')
    console.log('\n🚀 Run `npm run dev` and visit http://localhost:3000')
    console.log('🛒 Users can now browse game-specific services and place orders!')

  } catch (error) {
    console.error('❌ Seed failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

seed()
