#!/usr/bin/env node
/**
 * Quick script to update game icon URLs in the database
 * Usage: node scripts/update-icons.mjs
 */

import mongoose from 'mongoose'
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
  console.warn('⚠️  No .env file found')
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI is not set')
  process.exit(1)
}

const { Schema } = mongoose

const GameSchema = new Schema({
  slug: String,
  name: String,
  iconUrl: String,
  description: String,
}, { timestamps: true })

const Game = mongoose.models.Game || mongoose.model('Game', GameSchema)

const iconUrls = {
  'cs2': '/images/cs2.png',
  'valorant': '/images/valorant.jpg',
  'lol': '/images/lol.jpg',
  'apex': '/images/apex.png',
}

async function updateIcons() {
  console.log('🖼️  Updating game icons...\n')

  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB\n')

    for (const [slug, iconUrl] of Object.entries(iconUrls)) {
      const result = await Game.updateOne(
        { slug },
        { $set: { iconUrl } }
      )
      if (result.modifiedCount > 0) {
        console.log(`  ✓ Updated ${slug} icon to ${iconUrl}`)
      } else {
        console.log(`  - ${slug} (no change or not found)`)
      }
    }

    console.log('\n✅ Icon update completed!')

  } catch (error) {
    console.error('❌ Update failed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

updateIcons()

