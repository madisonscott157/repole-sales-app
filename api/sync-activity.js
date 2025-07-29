// Vercel Serverless Function for sync-activity
import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { saleId, userId, userName, editing, lastSyncTime } = req.body

    if (!saleId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const now = Date.now()

    // Update this user's activity
    const userActivityKey = `${saleId}:activity:${userId}`
    await kv.set(userActivityKey, {
      userId,
      userName: userName || 'Anonymous',
      editing: editing || [],
      lastSeen: now
    }, { ex: 30 }) // Expire after 30 seconds

    // Get all active users for this sale
    const activityPattern = `${saleId}:activity:*`
    const keys = await kv.keys(activityPattern)
    
    const otherUsers = []
    for (const key of keys) {
      const activity = await kv.get(key)
      if (activity && activity.userId !== userId && (now - activity.lastSeen) < 30000) {
        otherUsers.push(activity)
      }
    }

    // Get recent data updates since lastSyncTime
    const dataUpdates = []
    if (lastSyncTime) {
      const dataKey = `${saleId}:data`
      const saleData = await kv.get(dataKey) || {}
      
      // For now, return all data - in production you'd filter by timestamp
      for (const horseId in saleData) {
        for (const field in saleData[horseId]) {
          dataUpdates.push({
            horseId,
            field,
            value: saleData[horseId][field],
            timestamp: now
          })
        }
      }
    }

    res.status(200).json({
      otherUsers,
      dataUpdates,
      timestamp: now
    })

  } catch (error) {
    console.error('Sync activity error:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}