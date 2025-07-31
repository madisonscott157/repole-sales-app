// Simple test version without Redis first
module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, saleId, userId } = req.body;
    
    // For now, always allow editing (no real locking)
    // This tests if the API works at all
    if (action === 'request') {
      return res.json({ success: true, message: 'Test: Lock acquired' });
    } else if (action === 'release') {
      return res.json({ success: true, message: 'Test: Lock released' });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
  } catch (error) {
    console.error('Edit lock error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}