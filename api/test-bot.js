/**
 * Test endpoint to verify bot is working
 * Visit: https://meteora-mcap-bot.vercel.app/api/test-bot
 */

import { bot } from '../index.js';

export default async function handler(req, res) {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    
    // Check if bot token is set
    if (!BOT_TOKEN) {
      return res.status(500).json({
        error: 'BOT_TOKEN not set',
        message: 'Please set BOT_TOKEN in Vercel environment variables'
      });
    }

    // Check if bot is initialized
    if (!bot) {
      return res.status(500).json({
        error: 'Bot not initialized',
        message: 'Bot instance is null or undefined'
      });
    }

    // Try to get bot info
    const botInfo = await bot.getMe();
    
    return res.status(200).json({
      success: true,
      bot: {
        id: botInfo.id,
        username: botInfo.username,
        first_name: botInfo.first_name,
        can_join_groups: botInfo.can_join_groups,
        can_read_all_group_messages: botInfo.can_read_all_group_messages
      },
      environment: {
        has_bot_token: !!BOT_TOKEN,
        token_length: BOT_TOKEN ? BOT_TOKEN.length : 0,
        webhook_url: process.env.WEBHOOK_URL || 'Not set',
        is_vercel: !!process.env.VERCEL
      }
    });
  } catch (error) {
    console.error('Test bot error:', error);
    return res.status(500).json({
      error: 'Failed to test bot',
      message: error.message,
      stack: error.stack
    });
  }
}

