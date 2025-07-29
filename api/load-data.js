// Vercel Serverless Function for loading saved data
import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { saleId } = req.query

    if (!saleId) {
      return res.status(400).json({ error: 'Missing saleId parameter' })
    }

    // Load the main data structure
    const dataKey = `${saleId}:data`
    const saleData = await kv.get(dataKey) || {}

    res.status(200).json({ 
      success: true, 
      data: saleData,
      timestamp: Date.now()
    })

  } catch (error) {
    console.error('Load data error:', error)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
}