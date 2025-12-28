# Meteora MCAP Bot

A Telegram bot that calculates and displays Meteora DLMM pool price ranges in Market Cap (MCAP) terms.

## Features

- Calculates MCAP range from Meteora DLMM pool price ranges
- Fetches real-time SOL price
- Gets token supply from Solana blockchain
- Supports scientific notation prices (e.g., 0.0₄24685899)

## Setup

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Edit `.env` and add your Telegram bot token:
```
BOT_TOKEN=your_bot_token_here
```

4. Run the bot:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Deployment

This bot supports both **polling** and **webhook** modes:
- **Polling mode**: Traditional long-running process (Railway, Render, Fly.io)
- **Webhook mode**: Serverless functions (Vercel, AWS Lambda)

📖 **See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guides** covering:
- Vercel (Serverless - Free)
- Railway
- Render
- Fly.io
- DigitalOcean
- And more!

## Usage

1. Start a chat with your bot on Telegram
2. Send `/start` to see instructions
3. Send a message with:
   - Meteora pool URL
   - Price range (e.g., `0.0₄24685899 - 0.0₄49048276`)

Example:
```
https://www.meteora.ag/dlmm/52E9CZM9wa8kXYGA5dNBtso6ekSo7vMWxgCHGxQXtSby
0.0₄24685899 - 0.0₄49048276
```

The bot will respond with the calculated MCAP range.

## Commands

- `/start` - Start the bot and see instructions
- `/help` - Show help message

## How It Works

1. Extracts pool address from Meteora URL
2. Fetches pool data from Meteora API
3. Gets token supply from Solana blockchain
4. Fetches current SOL price
5. Calculates MCAP = (Price in SOL × SOL Price) × Token Supply
6. Displays the MCAP range

## Notes

- The bot uses the Solana mainnet RPC endpoint
- SOL price is fetched from CoinGecko (with Jupiter as fallback)
- Token supply is fetched directly from Solana blockchain

## Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `BOT_TOKEN` | Yes | Telegram bot token from @BotFather | - |
| `SOLANA_RPC` | No | Solana RPC endpoint | `https://api.mainnet-beta.solana.com` |
| `WEBHOOK_URL` | Conditional | Webhook URL (required for Vercel/serverless) | - |
| `PORT` | No | Port for local development | `3000` |

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/meteora-mcap-bot)

1. Click the button above or import to Vercel
2. Set environment variables:
   - `BOT_TOKEN`: Your Telegram bot token
   - `WEBHOOK_URL`: Will be set automatically after deployment
3. Deploy!

