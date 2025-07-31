export default async function handler(req, res) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, saleId, userId } = req.body;
    
    // For now, always allow editing to clear the stuck lock situation
    // This is a temporary fix while we debug the KV issues
    if (action === 'request') {
      return res.status(200).json({ success: true, message: 'Lock acquired (bypass mode)' });
    } else if (action === 'release') {
      return res.status(200).json({ success: true, message: 'Lock released (bypass mode)' });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
  } catch (error) {
    console.error('Edit lock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}