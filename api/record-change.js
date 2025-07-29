// Vercel Serverless Function for record-change
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
    const { saleId, horseId, field, value, userId, timestamp } = req.body

    if (!saleId || !horseId || !field) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Store the field change
    const changeKey = `${saleId}:${horseId}:${field}`
    await kv.set(changeKey, {
      value,
      userId,
      timestamp: timestamp || Date.now(),
      lastModified: Date.now()
    })

    // Store in main data structure
    const dataKey = `${saleId}:data`
    let saleData = await kv.get(dataKey) || {}
    
    if (!saleData[horseId]) {
      saleData[horseId] = {}
    }
    
    saleData[horseId][field] = value
    await kv.set(dataKey, saleData)

    res.status(200).json({ 
      success: true, 
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Record change error:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}