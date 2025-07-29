// Vercel Serverless Function for record-change
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
    const { saleId, horseId, field, value, userId, timestamp } = req.body

    console.log('Record change called:', { saleId, horseId, field, value })

    // Test response - no Redis for now
    res.status(200).json({ 
      success: true, 
      timestamp: Date.now(),
      debug: 'API is working!',
      received: { saleId, horseId, field, value }
    })

  } catch (error) {
    console.error('Record change error:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}