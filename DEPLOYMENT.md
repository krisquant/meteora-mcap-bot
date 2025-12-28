# Deployment Guide

This guide covers multiple hosting options for your Telegram bot.

## Table of Contents
- [Vercel (Serverless - Recommended for Free Tier)](#vercel-serverless)
- [Railway](#railway)
- [Render](#render)
- [Fly.io](#flyio)
- [DigitalOcean App Platform](#digitalocean)
- [Local Development](#local-development)

---

## Vercel (Serverless)

**Best for:** Free hosting, serverless architecture, automatic deployments

### Prerequisites
- GitHub account
- Vercel account (free tier available)

### Steps

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/meteora-mcap-bot.git
  git 
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `BOT_TOKEN`: Your Telegram bot token
     - `WEBHOOK_URL`: Will be set automatically after first deployment (format: `https://your-project.vercel.app`)
     - `SOLANA_RPC`: (Optional) Custom Solana RPC endpoint

3. **Set Webhook URL**
   After deployment, Vercel will give you a URL like `https://your-project.vercel.app`
   - Go to your Vercel project settings
   - Add environment variable: `WEBHOOK_URL=https://your-project.vercel.app`
   - Redeploy the project

4. **Verify Webhook**
   The bot will automatically set the webhook on startup. You can verify it's working by:
   - Sending a message to your bot on Telegram
   - Checking Vercel function logs

### Notes
- Vercel functions have a 10-second timeout on the free tier (60s on Pro)
- Cold starts may cause slight delays
- No cost for low traffic

---

## Railway

**Best for:** Simple deployment, long-running processes, easy environment management

### Steps

1. **Install Railway CLI** (optional, or use web interface)
   ```bash
   npm i -g @railway/cli
   railway login
   ```

2. **Deploy**
   ```bash
   railway init
   railway up
   ```

3. **Set Environment Variables**
   In Railway dashboard or via CLI:
   ```bash
   railway variables set BOT_TOKEN=your_bot_token
   railway variables set SOLANA_RPC=https://api.mainnet-beta.solana.com
   # Don't set WEBHOOK_URL - we'll use polling mode
   ```

4. **Start Command**
   Railway will auto-detect `npm start` from package.json

### Pricing
- Free tier: $5 credit/month
- Pay-as-you-go after that

---

## Render

**Best for:** Free tier with automatic deployments

### Steps

1. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: meteora-mcap-bot
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free (or paid for better performance)

3. **Set Environment Variables**
   - `BOT_TOKEN`: Your Telegram bot token
   - `SOLANA_RPC`: (Optional) Custom Solana RPC endpoint
   - Don't set `WEBHOOK_URL` (use polling mode)

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

### Notes
- Free tier spins down after 15 minutes of inactivity
- First request after spin-down may be slow (cold start)
- Automatic deployments on git push

---

## Fly.io

**Best for:** Global edge deployment, Docker support

### Steps

1. **Install Fly CLI**
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Create Fly App**
   ```bash
   fly launch
   ```

4. **Set Secrets**
   ```bash
   fly secrets set BOT_TOKEN=your_bot_token
   fly secrets set SOLANA_RPC=https://api.mainnet-beta.solana.com
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

### Pricing
- Free tier: 3 shared VMs
- Pay-as-you-go for additional resources

---

## DigitalOcean

**Best for:** Predictable pricing, full control

### Steps

1. **Create App Platform Project**
   - Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
   - Click "Create App"
   - Connect GitHub repository

2. **Configure App**
   - **Type**: Web Service
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **Environment Variables**:
     - `BOT_TOKEN`
     - `SOLANA_RPC` (optional)

3. **Deploy**
   - Click "Create Resources"
   - Wait for deployment

### Pricing
- Starts at $5/month for basic plan

---

## Local Development

### Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your `BOT_TOKEN`

3. **Run Bot**
   ```bash
   # Polling mode (default)
   npm start
   
   # Development with auto-reload
   npm run dev
   ```

### Testing Webhook Mode Locally

1. **Install ngrok** (for local webhook testing)
   ```bash
   # Download from https://ngrok.com
   ngrok http 3000
   ```

2. **Set Environment Variable**
   ```bash
   # In .env file
   WEBHOOK_URL=https://your-ngrok-url.ngrok.io
   ```

3. **Run Bot**
   ```bash
   npm start
   ```

---

## Environment Variables Reference

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `BOT_TOKEN` | Yes | Telegram bot token from @BotFather | - |
| `SOLANA_RPC` | No | Solana RPC endpoint | `https://api.mainnet-beta.solana.com` |
| `WEBHOOK_URL` | Conditional | Webhook URL (required for Vercel) | - |
| `PORT` | No | Port for local development | `3000` |

---

## Troubleshooting

### Bot Not Responding

1. **Check Logs**
   - Vercel: Dashboard → Functions → Logs
   - Railway: Dashboard → Deployments → Logs
   - Render: Dashboard → Logs

2. **Verify Bot Token**
   - Make sure `BOT_TOKEN` is set correctly
   - Test token with: `curl https://api.telegram.org/bot<TOKEN>/getMe`

3. **Webhook Issues (Vercel)**
   - Ensure `WEBHOOK_URL` is set correctly
   - Check webhook status: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
   - Delete webhook if needed: `curl -X POST https://api.telegram.org/bot<TOKEN>/deleteWebhook`

4. **Polling Issues**
   - Ensure `WEBHOOK_URL` is NOT set
   - Check that the process is running continuously
   - Verify no firewall blocking outbound connections

---

## Recommended Hosting by Use Case

- **Free Tier / Low Traffic**: Vercel or Render
- **Simple Setup**: Railway
- **Global Edge**: Fly.io
- **Production / High Traffic**: DigitalOcean or Railway Pro
- **Local Development**: Use polling mode with `.env` file

---

## Security Notes

⚠️ **Important**: Never commit your `.env` file or expose your `BOT_TOKEN` in code!

- Always use environment variables
- Add `.env` to `.gitignore`
- Rotate your bot token if exposed
- Use secrets management in your hosting platform

