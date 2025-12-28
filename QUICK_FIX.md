# Quick Fix for Your Bot

Your bot is deployed at: **https://meteora-mcap-bot.vercel.app/**

## Current Status
✅ Health endpoint works  
✅ Webhook setup endpoint works  
⚠️ Webhook has a 308 redirect error (being fixed)

## Steps to Fix:

### 1. Set Environment Variables in Vercel
Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add:
- `BOT_TOKEN` = `8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8`
- `WEBHOOK_URL` = `https://meteora-mcap-bot.vercel.app` (no trailing slash!)

### 2. After Code Updates (wait 1-2 minutes for auto-deploy)
Then visit this URL to reconfigure the webhook:
```
https://meteora-mcap-bot.vercel.app/api/setup-webhook
```

### 3. Verify Webhook
Check webhook status:
```
https://api.telegram.org/bot8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8/getWebhookInfo
```

Should show:
- `url`: `https://meteora-mcap-bot.vercel.app/api/webhook` (single slash)
- `pending_updates`: Should decrease to 0
- `last_error`: Should be empty or "None"

### 4. Test Your Bot
1. Open Telegram
2. Find your bot
3. Send `/start`
4. Should respond!

## If Still Not Working:

### Check Vercel Logs
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Go to "Functions" tab
4. Click on `api/webhook`
5. Check "Logs" for errors

### Test Endpoints Manually
- Health: https://meteora-mcap-bot.vercel.app/api/health ✅
- Setup: https://meteora-mcap-bot.vercel.app/api/setup-webhook
- Webhook: https://meteora-mcap-bot.vercel.app/api/webhook (POST only)

### Common Issues:
1. **308 Redirect Error**: Usually means webhook URL has trailing slash or double slash - fixed in latest code
2. **Bot not responding**: Check Vercel function logs for errors
3. **Timeout errors**: Vercel free tier has 10s limit - some operations might timeout

## Next Steps:
1. Wait for auto-deploy (1-2 min after git push)
2. Visit setup endpoint again
3. Test bot in Telegram

