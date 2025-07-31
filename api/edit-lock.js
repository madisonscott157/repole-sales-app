import { kv } from '@vercel/kv';

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
    
    if (!action || !saleId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const lockKey = `edit_lock:${saleId}`;
    const lockTimeout = 15 * 60; // 15 minutes in seconds

    if (action === 'request') {
      // Check if lock exists
      const currentLock = await kv.get(lockKey);
      
      if (currentLock) {
        const lockData = JSON.parse(currentLock);
        
        // Check if lock is expired
        const now = Date.now();
        if (now - lockData.timestamp < lockTimeout * 1000) {
          // Lock is still active
          if (lockData.userId !== userId) {
            return res.status(200).json({
              success: false,
              message: `Sale is being edited by another user (started ${Math.floor((now - lockData.timestamp) / 60000)} minutes ago)`
            });
          } else {
            // Same user, refresh the lock
            await kv.setex(lockKey, lockTimeout, JSON.stringify({
              userId,
              timestamp: now
            }));
            return res.status(200).json({ success: true, message: 'Lock refreshed' });
          }
        }
      }
      
      // Create new lock
      await kv.setex(lockKey, lockTimeout, JSON.stringify({
        userId,
        timestamp: Date.now()
      }));
      
      return res.status(200).json({ success: true, message: 'Lock acquired' });
      
    } else if (action === 'release') {
      // Only allow the lock owner to release it
      const currentLock = await kv.get(lockKey);
      if (currentLock) {
        const lockData = JSON.parse(currentLock);
        if (lockData.userId === userId) {
          await kv.del(lockKey);
        }
      }
      
      return res.status(200).json({ success: true, message: 'Lock released' });
      
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
  } catch (error) {
    console.error('Edit lock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}