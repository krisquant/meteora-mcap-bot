# Environment Variables Reference

## Required Variables

### BOT_TOKEN
Your Telegram bot token from @BotFather
```
BOT_TOKEN=8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8
```

## Optional Variables

### SOLANA_RPC
Solana RPC endpoint (defaults to public mainnet if not set)
```
SOLANA_RPC=https://api.mainnet-beta.solana.com
```

### WEBHOOK_URL
Required for Vercel/serverless deployments. Leave empty for polling mode.
```
WEBHOOK_URL=https://your-project.vercel.app
```

### PORT
Only used for local development (defaults to 3000)
```
PORT=3000
```

---

## Platform-Specific Configurations

### Local Development (.env file)
```env
BOT_TOKEN=8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8
SOLANA_RPC=https://api.mainnet-beta.solana.com
PORT=3000
```

### Vercel (Serverless)
```env
BOT_TOKEN=8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8
WEBHOOK_URL=https://your-project.vercel.app
SOLANA_RPC=https://api.mainnet-beta.solana.com
```

### Railway/Render/Fly.io (Polling Mode)
```env
BOT_TOKEN=8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8
SOLANA_RPC=https://api.mainnet-beta.solana.com
```
(Don't set WEBHOOK_URL for polling mode)

---

## How to Set in Different Platforms

### Vercel
1. Go to Project Settings → Environment Variables
2. Add each variable:
   - `BOT_TOKEN` = your token
   - `WEBHOOK_URL` = your Vercel URL (after first deploy)
   - `SOLANA_RPC` = (optional) custom RPC

### Railway
1. Go to your service → Variables
2. Add each variable or use CLI:
   ```bash
   railway variables set BOT_TOKEN=your_token
   ```

### Render
1. Go to your service → Environment
2. Add each variable in the UI

### Local (.env file)
1. Create `.env` file in project root
2. Copy the variables above
3. Update `BOT_TOKEN` with your actual token

