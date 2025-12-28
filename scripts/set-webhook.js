/**
 * Script to set Telegram webhook URL
 * Usage: node scripts/set-webhook.js <webhook-url>
 */

import TelegramBot from 'node-telegram-bot-api';

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.argv[2] || process.env.WEBHOOK_URL;

if (!BOT_TOKEN) {
  console.error('❌ BOT_TOKEN environment variable is required');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('❌ WEBHOOK_URL is required (as argument or environment variable)');
  console.error('Usage: node scripts/set-webhook.js <webhook-url>');
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN);

async function setWebhook() {
  try {
    const webhookPath = `${WEBHOOK_URL}/api/webhook`;
    await bot.setWebHook(webhookPath);
    console.log(`✅ Webhook set to: ${webhookPath}`);
    
    // Verify webhook
    const info = await bot.getWebHookInfo();
    console.log('\n📋 Webhook Info:');
    console.log(`   URL: ${info.url}`);
    console.log(`   Pending Updates: ${info.pending_update_count}`);
    console.log(`   Last Error: ${info.last_error_message || 'None'}`);
  } catch (error) {
    console.error('❌ Error setting webhook:', error.message);
    process.exit(1);
  }
}

setWebhook();

