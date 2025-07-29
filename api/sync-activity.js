// Vercel Serverless Function for sync-activity
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
    // For now, just return a test response to see if the API works
    const { saleId, userId, userName, editing, lastSyncTime } = req.body

    console.log('Sync activity called:', { saleId, userId, editing })

    // Test response - no Redis for now
    res.status(200).json({
      otherUsers: [], // Empty for now
      dataUpdates: [],
      timestamp: Date.now(),
      debug: 'API is working!'
    })

  } catch (error) {
    console.error('Sync activity error:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}