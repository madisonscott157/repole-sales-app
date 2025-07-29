import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { saleId, horseId, field, value, userId, timestamp } = req.body

    if (!saleId || !horseId || !field || userId === undefined) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const now = timestamp || Date.now()
    
    // Create change record
    const changeRecord = {
      saleId,
      horseId,
      field,
      value,
      userId,
      timestamp: now
    }

    // Store in sorted set with timestamp as score for easy retrieval
    const changesKey = `changes:${saleId}`
    await redis.zadd(changesKey, now, JSON.stringify(changeRecord))

    // Keep only last 1000 changes per sale (cleanup old data)
    await redis.zremrangebyrank(changesKey, 0, -1001)

    // Also update the main sale data
    const saleDataKey = `solis_litt_sales_data:${saleId}`
    const existingSaleData = await redis.get(saleDataKey)
    
    if (existingSaleData) {
      const saleData = JSON.parse(existingSaleData)
      
      // Find and update the specific horse's field
      if (saleData.data && saleData.data.combinedData) {
        const horseIndex = saleData.data.combinedData.findIndex(horse => 
          horse.Hip === horseId || horse.hip === horseId
        )
        
        if (horseIndex !== -1) {
          saleData.data.combinedData[horseIndex][field] = value
          saleData.lastModified = now
          
          // Save updated sale data
          await redis.set(saleDataKey, JSON.stringify(saleData))
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      timestamp: now 
    })

  } catch (error) {
    console.error('Record change error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}