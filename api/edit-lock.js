import { createClient } from '@upstash/redis';

const redis = createClient({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
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
    const lockKey = `edit_lock:${saleId}`;
    const lockTimeout = 15 * 60; // 15 minutes in seconds

    if (action === 'request') {
      // Check if lock exists
      const currentLock = await redis.get(lockKey);
      
      if (currentLock) {
        const lockData = JSON.parse(currentLock);
        
        // Check if lock is expired
        const now = Date.now();
        if (now - lockData.timestamp < lockTimeout * 1000) {
          // Lock is still active
          if (lockData.userId !== userId) {
            return res.json({
              success: false,
              message: `Sale is being edited by another user (started ${Math.floor((now - lockData.timestamp) / 60000)} minutes ago)`
            });
          } else {
            // Same user, refresh the lock
            await redis.setex(lockKey, lockTimeout, JSON.stringify({
              userId,
              timestamp: now
            }));
            return res.json({ success: true, message: 'Lock refreshed' });
          }
        }
      }
      
      // Create new lock
      await redis.setex(lockKey, lockTimeout, JSON.stringify({
        userId,
        timestamp: Date.now()
      }));
      
      return res.json({ success: true, message: 'Lock acquired' });
      
    } else if (action === 'release') {
      // Only allow the lock owner to release it
      const currentLock = await redis.get(lockKey);
      if (currentLock) {
        const lockData = JSON.parse(currentLock);
        if (lockData.userId === userId) {
          await redis.del(lockKey);
        }
      }
      
      return res.json({ success: true, message: 'Lock released' });
      
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
  } catch (error) {
    console.error('Edit lock error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}