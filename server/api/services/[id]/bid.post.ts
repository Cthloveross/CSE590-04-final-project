import { defineEventHandler, createError, readBody } from 'h3'
import { z } from 'zod'
import { connectToDatabase } from '~/server/utils/db'
import { ServiceModel } from '~/server/models/Service'
import { BidModel } from '~/server/models/Bid'
import { requireUser } from '~/server/utils/auth'

const bidSchema = z.object({
  bidAmount: z.number().min(1),
})

export default defineEventHandler(async (event) => {
  await connectToDatabase()
  
  const user = await requireUser(event)
  const serviceId = event.context.params?.id
  
  if (!serviceId) {
    throw createError({ statusCode: 400, statusMessage: 'Service ID required' })
  }

  const body = await readBody(event)
  const parsed = bidSchema.safeParse(body)
  
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid bid amount' })
  }

  const { bidAmount } = parsed.data

  // Get the service
  const service = await ServiceModel.findById(serviceId)
  if (!service) {
    throw createError({ statusCode: 404, statusMessage: 'Service not found' })
  }

  // Check if auction has ended
  if (new Date() > service.auctionEndTime) {
    throw createError({ statusCode: 400, statusMessage: 'Auction has ended' })
  }

  // Check if bid is higher than current bid
  if (bidAmount <= service.currentBid) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: `Bid must be higher than current bid of $${service.currentBid}` 
    })
  }

  // Update service with new highest bid
  service.currentBid = bidAmount
  service.highestBidder = user._id
  service.bidCount = (service.bidCount || 0) + 1
  await service.save()

  // Record the bid
  const bid = await BidModel.create({
    serviceId: service._id,
    userId: user._id,
    bidAmount,
    timestamp: new Date(),
  })

  return {
    success: true,
    currentBid: service.currentBid,
    bidCount: service.bidCount,
    isHighestBidder: true,
  }
})
