/**
 * Setup endpoint to configure Telegram webhook
 * Call this after deploying to Vercel: https://your-project.vercel.app/api/setup-webhook
 */

import TelegramBot from 'node-telegram-bot-api';

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BOT_TOKEN = process.env.BOT_TOKEN;
  const WEBHOOK_URL = process.env.WEBHOOK_URL || req.query.url;

  if (!BOT_TOKEN) {
    return res.status(500).json({ 
      error: 'BOT_TOKEN environment variable is not set',
      message: 'Please set BOT_TOKEN in Vercel environment variables'
    });
  }

  if (!WEBHOOK_URL) {
    return res.status(400).json({ 
      error: 'WEBHOOK_URL is required',
      message: 'Set WEBHOOK_URL environment variable or pass ?url=https://your-project.vercel.app',
      usage: 'https://your-project.vercel.app/api/setup-webhook?url=https://your-project.vercel.app'
    });
  }

  try {
    const bot = new TelegramBot(BOT_TOKEN);
    const webhookPath = `${WEBHOOK_URL}/api/webhook`;
    
    // Set webhook
    await bot.setWebHook(webhookPath);
    
    // Get webhook info
    const info = await bot.getWebHookInfo();
    
    return res.status(200).json({
      success: true,
      message: 'Webhook configured successfully',
      webhook: {
        url: info.url,
        pending_updates: info.pending_update_count,
        last_error: info.last_error_message || 'None',
        last_error_date: info.last_error_date || null
      }
    });
  } catch (error) {
    console.error('Error setting webhook:', error);
    return res.status(500).json({
      error: 'Failed to set webhook',
      message: error.message
    });
  }
}

