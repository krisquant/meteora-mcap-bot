# Bot Setup Guide - Vercel Deployment

## Quick Fix: Why Your Bot Isn't Working

After deploying to Vercel, you need to **manually set up the webhook** with Telegram. Here's how:

## Step-by-Step Setup

### 1. Get Your Vercel URL
After deployment, you'll have a URL like:
```
https://meteora-mcap-bot.vercel.app
```

### 2. Set Environment Variables in Vercel
Go to your Vercel project → Settings → Environment Variables and add:

```
BOT_TOKEN=8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8
WEBHOOK_URL=https://your-project.vercel.app
```

**Important:** Replace `your-project.vercel.app` with your actual Vercel URL!

### 3. Configure the Webhook

**Option A: Use the Setup Endpoint (Easiest)**
After setting environment variables, visit:
```
https://your-project.vercel.app/api/setup-webhook
```

Or with URL parameter:
```
https://your-project.vercel.app/api/setup-webhook?url=https://your-project.vercel.app
```

You should see:
```json
{
  "success": true,
  "message": "Webhook configured successfully",
  "webhook": {
    "url": "https://your-project.vercel.app/api/webhook",
    "pending_updates": 0,
    "last_error": "None"
  }
}
```

**Option B: Use the Script**
```bash
# Set environment variable first
$env:BOT_TOKEN="8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8"
node scripts/set-webhook.js https://your-project.vercel.app
```

**Option C: Manual API Call**
```bash
curl -X POST "https://api.telegram.org/bot8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8/setWebhook?url=https://your-project.vercel.app/api/webhook"
```

### 4. Verify Webhook is Working

Check webhook status:
```bash
curl "https://api.telegram.org/bot8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8/getWebhookInfo"
```

Or visit:
```
https://api.telegram.org/bot8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8/getWebhookInfo
```

### 5. Test Your Bot
1. Open Telegram
2. Find your bot
3. Send `/start`
4. The bot should respond!

## Troubleshooting

### Bot Still Not Responding?

1. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Click on `api/webhook` function
   - Check "Logs" tab for errors

2. **Test Health Endpoint**
   ```
   https://your-project.vercel.app/api/health
   ```
   Should return: `{"status":"ok","message":"Bot API is running"}`

3. **Test Webhook Endpoint**
   - Check if `/api/webhook` exists
   - Should return 405 for GET requests (that's normal)

4. **Verify Environment Variables**
   - `BOT_TOKEN` must be set
   - `WEBHOOK_URL` must match your Vercel URL exactly

5. **Check Webhook URL Format**
   - Must be: `https://your-project.vercel.app/api/webhook`
   - Must use HTTPS (not HTTP)
   - No trailing slash

6. **Delete Old Webhook (if needed)**
   ```bash
   curl -X POST "https://api.telegram.org/bot8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8/deleteWebhook"
   ```
   Then set it again using Option A above.

### Common Errors

**Error: "BOT_TOKEN environment variable is not set"**
- Go to Vercel → Settings → Environment Variables
- Add `BOT_TOKEN` with your token
- Redeploy

**Error: "WEBHOOK_URL is required"**
- Add `WEBHOOK_URL` environment variable in Vercel
- Value should be: `https://your-project.vercel.app`
- Redeploy

**Error: "Webhook was set, but bot doesn't respond"**
- Check Vercel function logs
- Make sure handlers are set up correctly
- Verify the webhook URL is correct

**Bot responds but with errors**
- Check Vercel function logs
- Look for API errors (CoinGecko, Solana RPC, etc.)
- Some errors might be timeout-related (Vercel free tier has 10s limit)

## Quick Checklist

- [ ] Code deployed to Vercel
- [ ] `BOT_TOKEN` environment variable set
- [ ] `WEBHOOK_URL` environment variable set (matches Vercel URL)
- [ ] Webhook configured via `/api/setup-webhook` or script
- [ ] Webhook verified via `getWebhookInfo`
- [ ] Tested bot with `/start` command

## Need Help?

1. Check Vercel function logs
2. Check webhook info: `getWebhookInfo` API
3. Test endpoints: `/api/health` and `/api/setup-webhook`
4. Verify all environment variables are set correctly

