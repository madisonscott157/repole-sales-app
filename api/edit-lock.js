import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Add CORS headers - exact same as sales.js
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests - exact same as sales.js
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    if (req.method === 'POST') {
      const { action, saleId, userId } = req.body;
      
      if (!action || !saleId || !userId) {
        return res.status(400).json({ error: 'Action, sale ID and user ID are required' });
      }

      if (action === 'request') {
        // Check if lock exists - using exact same pattern as sales.js
        const lockKey = `lock:${saleId}`;
        const lockData = await kv.hgetall(lockKey);
        
        if (lockData && Object.keys(lockData).length > 0) {
          // Lock exists, check if expired (15 minutes = 900000ms)
          const now = Date.now();
          const lockTime = parseInt(lockData.timestamp);
          const timeElapsed = now - lockTime;
          
          if (timeElapsed < 900000) {
            // Lock is still active
            if (lockData.userId !== userId) {
              const minutesAgo = Math.floor(timeElapsed / 60000);
              return res.status(200).json({
                success: false,
                message: `Another user is editing this sale (started ${minutesAgo} minutes ago)`
              });
            }
          }
        }
        
        // Create or refresh lock - using exact same pattern as sales.js
        const lockInfo = {
          userId: userId,
          timestamp: Date.now().toString(),
          saleId: saleId
        };
        
        await kv.hset(`lock:${saleId}`, lockInfo);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Edit lock acquired'
        });

      } else if (action === 'release') {
        // Delete lock - using exact same pattern as sales.js
        await kv.del(`lock:${saleId}`);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Edit lock released'
        });

      } else {
        return res.status(400).json({ error: 'Invalid action' });
      }

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Edit lock API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}