export default async function handler(req, res) {
    res.status(200).json({
      message: 'API is working!',
      timestamp: new Date().toISOString(),
      env: {
        hasRedisUrl: !!process.env.KV_REST_API_URL,
        hasRedisToken: !!process.env.KV_REST_API_TOKEN,
        hasBlobToken: !!process.env.BLOB_READ_WRITE_TOKEN
      }
    });
  }
