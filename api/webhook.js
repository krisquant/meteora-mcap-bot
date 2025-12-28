import { bot, setupBotHandlers } from '../index.js';

// Ensure handlers are set up (they should be, but ensure it)
setupBotHandlers();

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Log incoming update for debugging
    console.log('Received webhook update:', JSON.stringify(req.body, null, 2));
    
    // Process the webhook update
    await bot.processUpdate(req.body);
    
    // Return 200 OK immediately
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    console.error('Error stack:', error.stack);
    // Still return 200 to prevent Telegram from retrying
    res.status(200).json({ ok: true, error: error.message });
  }
}

