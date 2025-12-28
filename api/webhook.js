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
    const update = req.body;
    console.log('📥 Received webhook update ID:', update.update_id);
    
    if (update.message) {
      console.log('💬 Message from:', update.message.from?.id, 'Text:', update.message.text?.substring(0, 50));
    }
    
    // Process the webhook update
    console.log('🔄 Processing update...');
    await bot.processUpdate(update);
    console.log('✅ Update processed successfully');
    
    // Return 200 OK immediately
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    // Still return 200 to prevent Telegram from retrying
    res.status(200).json({ ok: true, error: error.message });
  }
}

