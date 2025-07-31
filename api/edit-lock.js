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
      // Check if lock exists using same pattern as sales.js
      const lockData = await kv.hgetall(lockKey);
      
      if (lockData && Object.keys(lockData).length > 0) {
        // Check if lock is expired
        const now = Date.now();
        const lockTimestamp = parseInt(lockData.timestamp);
        
        if (now - lockTimestamp < lockTimeout * 1000) {
          // Lock is still active
          if (lockData.userId !== userId) {
            return res.status(200).json({
              success: false,
              message: `Sale is being edited by another user (started ${Math.floor((now - lockTimestamp) / 60000)} minutes ago)`
            });
          } else {
            // Same user, refresh the lock
            await kv.hset(lockKey, {
              userId: userId,
              timestamp: now.toString()
            });
            return res.status(200).json({ success: true, message: 'Lock refreshed' });
          }
        }
      }
      
      // Create new lock using same pattern as sales.js
      await kv.hset(lockKey, {
        userId: userId,
        timestamp: Date.now().toString()
      });
      
      return res.status(200).json({ success: true, message: 'Lock acquired' });
      
    } else if (action === 'release') {
      // Delete the lock
      await kv.del(lockKey);
      return res.status(200).json({ success: true, message: 'Lock released' });
      
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
  } catch (error) {
    console.error('Edit lock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}