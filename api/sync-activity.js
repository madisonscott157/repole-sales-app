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
    const { saleId, userId, userName, editing, lastSyncTime } = req.body

    if (!saleId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const now = Date.now()
    
    // Store current user's editing activity
    const userActivityKey = `activity:${saleId}:${userId}`
    const userActivity = {
      userId,
      userName: userName || 'User',
      editing: editing || [],
      timestamp: now
    }
    
    // Store with 60 second expiration (auto-cleanup)
    await redis.setex(userActivityKey, 60, JSON.stringify(userActivity))

    // Get all other users' activity for this sale
    const activityKeys = await redis.keys(`activity:${saleId}:*`)
    const otherUsers = []

    for (const key of activityKeys) {
      if (key !== userActivityKey) {
        const activityData = await redis.get(key)
        if (activityData) {
          const activity = JSON.parse(activityData)
          
          // Only include if activity is recent (within 45 seconds)
          if (now - activity.timestamp < 45000) {
            otherUsers.push({
              userId: activity.userId,
              userName: activity.userName,
              editing: activity.editing
            })
          } else {
            // Clean up stale activity
            await redis.del(key)
          }
        }
      }
    }

    // Get recent data changes since lastSyncTime
    let dataUpdates = []
    if (lastSyncTime) {
      const changesKey = `changes:${saleId}`
      const recentChanges = await redis.zrangebyscore(changesKey, lastSyncTime, now)
      
      dataUpdates = recentChanges
        .map(change => {
          try {
            return JSON.parse(change)
          } catch (e) {
            return null
          }
        })
        .filter(change => change && change.userId !== userId) // Don't send back user's own changes
    }

    res.status(200).json({
      otherUsers,
      dataUpdates,
      timestamp: now
    })

  } catch (error) {
    console.error('Sync activity error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}