// Health check endpoint for Vercel
export default async function handler(req, res) {
  return res.status(200).json({ 
    status: 'ok',
    message: 'Bot API is running',
    timestamp: new Date().toISOString()
  });
}

