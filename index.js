import TelegramBot from 'node-telegram-bot-api';
import axios from 'axios';
import { Connection, PublicKey } from '@solana/web3.js';

const BOT_TOKEN = process.env.BOT_TOKEN || '8237599945:AAFyHTv3_VfdoWvo2DqWLCfH8L81sAwZjs8';
const SOLANA_RPC = process.env.SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

// Initialize bot - use webhook if WEBHOOK_URL is set, otherwise use polling
// For serverless, don't start polling automatically
const botOptions = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME
  ? {} // Serverless - no polling, webhook will be handled by API route
  : WEBHOOK_URL
  ? { webHook: true }
  : { polling: true };
const bot = new TelegramBot(BOT_TOKEN, botOptions);
const connection = new Connection(SOLANA_RPC, 'confirmed');

// Helper function to parse scientific notation like 0.0₄24685899
function parsePrice(priceStr) {
  // Remove any spaces
  priceStr = priceStr.trim();
  
  // Check for subscript notation pattern: 0.0₄24685899 means 0.000024685899
  // The subscript number indicates how many zeros to add after "0.0"
  const subscriptMap = {
    '₀': 0, '₁': 1, '₂': 2, '₃': 3, '₄': 4,
    '₅': 5, '₆': 6, '₇': 7, '₈': 8, '₉': 9
  };
  
  // Match pattern like 0.0₄123456
  const match = priceStr.match(/0\.0([₀₁₂₃₄₅₆₇₈₉])(\d+)/);
  if (match) {
    const subscript = match[1];
    const digits = match[2];
    const zeroCount = subscriptMap[subscript];
    
    // 0.0 already has 1 zero, subscript tells us how many MORE zeros to add
    // So total zeros after decimal = 1 (from 0.0) + zeroCount (from subscript)
    // But we want: 0.0 + (zeroCount zeros) + digits
    // Example: 0.0₄24685899 = 0.0 + 0000 + 24685899 = 0.000024685899
    const fullNumber = '0.' + '0'.repeat(zeroCount) + digits;
    return parseFloat(fullNumber);
  }
  
  // Try to parse as regular number
  return parseFloat(priceStr.replace(/[^0-9.]/g, ''));
}

// Get SOL price in USD
async function getSOLPrice() {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
    return response.data.solana.usd;
  } catch (error) {
    console.error('Error fetching SOL price:', error);
    // Fallback to Jupiter API
    try {
      const response = await axios.get('https://price.jup.ag/v4/price?ids=SOL');
      return response.data.data.SOL.price;
    } catch (e) {
      console.error('Error fetching SOL price from Jupiter:', e);
      return null;
    }
  }
}

// Extract pool address from Meteora URL
function extractPoolAddress(url) {
  const match = url.match(/dlmm\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

// Fetch pool data from Meteora API
async function getPoolData(poolAddress) {
  try {
    // Try Meteora DLMM API
    const response = await axios.get(`https://dlmm-api.meteora.ag/pair/${poolAddress}`, {
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching pool data from Meteora API:', error.message);
    // Try alternative Meteora API endpoint
    try {
      const response = await axios.get(`https://api.meteora.ag/dlmm/pair/${poolAddress}`, {
        timeout: 10000
      });
      return response.data;
    } catch (e) {
      console.error('Error fetching from alternative API:', e.message);
      return null;
    }
  }
}

// Get token supply
async function getTokenSupply(mintAddress) {
  try {
    const mintPubkey = new PublicKey(mintAddress);
    const supply = await connection.getTokenSupply(mintPubkey);
    return parseFloat(supply.value.amount) / Math.pow(10, supply.value.decimals);
  } catch (error) {
    console.error('Error fetching token supply:', error);
    return null;
  }
}

// Get token metadata (name, symbol)
async function getTokenMetadata(mintAddress) {
  try {
    // Try to get from Jupiter token list
    const response = await axios.get('https://token.jup.ag/all');
    const tokens = response.data;
    const token = tokens.find(t => t.address === mintAddress);
    if (token) {
      return {
        name: token.name,
        symbol: token.symbol
      };
    }
  } catch (error) {
    console.error('Error fetching token metadata:', error);
  }
  
  // Fallback: try Solana token registry
  try {
    const response = await axios.get(`https://api.solana.fm/v0/tokens/${mintAddress}`);
    if (response.data && response.data.token) {
      return {
        name: response.data.token.name,
        symbol: response.data.token.symbol
      };
    }
  } catch (e) {
    console.error('Error fetching from Solana FM:', e);
  }
  
  return null;
}

// Calculate MCAP range
function calculateMCAPRange(minPrice, maxPrice, supply, solPrice) {
  if (!supply || !solPrice) return null;
  
  // Prices are in SOL, convert to USD
  const minPriceUSD = minPrice * solPrice;
  const maxPriceUSD = maxPrice * solPrice;
  
  const minMCAP = minPriceUSD * supply;
  const maxMCAP = maxPriceUSD * supply;
  
  return {
    min: minMCAP,
    max: maxMCAP,
    minFormatted: formatMCAP(minMCAP),
    maxFormatted: formatMCAP(maxMCAP)
  };
}

// Format MCAP value
function formatMCAP(value) {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(2) + 'm';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(2) + 'k';
  }
  return value.toFixed(2);
}

// Setup all bot handlers
function setupBotHandlers() {
  // Main command handler
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    console.log('📨 /start command received from chat:', chatId);
    try {
      await bot.sendMessage(chatId, 
        '👋 Welcome to Meteora MCAP Bot!\n\n' +
        'Send me:\n' +
        '1. A Meteora DLMM pool link\n' +
        '2. Price range (e.g., 0.0₄24685899 - 0.0₄49048276)\n\n' +
        'Example:\n' +
        'https://www.meteora.ag/dlmm/52E9CZM9wa8kXYGA5dNBtso6ekSo7vMWxgCHGxQXtSby\n' +
        '0.0₄24685899 - 0.0₄49048276'
      );
      console.log('✅ /start response sent to chat:', chatId);
    } catch (error) {
      console.error('❌ Error sending /start response:', error);
    }
  });

  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    console.log('📨 /help command received from chat:', chatId);
    try {
      await bot.sendMessage(chatId,
        '📖 How to use:\n\n' +
        'Send me a message with:\n' +
        '• Meteora pool URL\n' +
        '• Price range (min - max)\n\n' +
        'The bot will calculate the MCAP range based on:\n' +
        '• Token price in SOL\n' +
        '• Token supply\n' +
        '• Current SOL price\n\n' +
        'Format example:\n' +
        'https://www.meteora.ag/dlmm/POOL_ADDRESS\n' +
        '0.0₄24685899 - 0.0₄49048276'
      );
      console.log('✅ /help response sent to chat:', chatId);
    } catch (error) {
      console.error('❌ Error sending /help response:', error);
    }
  });

  // Handle messages with pool links and price ranges
  bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  console.log('📨 Message received:', { chatId, text: text?.substring(0, 50), messageId: msg.message_id });

  // Skip commands
  if (text && text.startsWith('/')) {
    console.log('⏭️ Skipping command (handled by onText)');
    return;
  }

  try {
    // Extract pool URL
    const urlMatch = text.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) {
      bot.sendMessage(chatId, '❌ Please provide a valid Meteora pool URL');
      return;
    }

    const poolUrl = urlMatch[0];
    const poolAddress = extractPoolAddress(poolUrl);
    
    if (!poolAddress) {
      bot.sendMessage(chatId, '❌ Could not extract pool address from URL');
      return;
    }

    // Extract price range
    const priceRangeMatch = text.match(/([\d.₀₁₂₃₄₅₆₇₈₉0-9]+)\s*-\s*([\d.₀₁₂₃₄₅₆₇₈₉0-9]+)/);
    if (!priceRangeMatch) {
      bot.sendMessage(chatId, '❌ Please provide a price range (e.g., 0.0₄24685899 - 0.0₄49048276)');
      return;
    }

    const minPriceStr = priceRangeMatch[1];
    const maxPriceStr = priceRangeMatch[2];

    bot.sendMessage(chatId, '⏳ Calculating MCAP range...');

    // Parse prices
    const minPrice = parsePrice(minPriceStr);
    const maxPrice = parsePrice(maxPriceStr);

    if (isNaN(minPrice) || isNaN(maxPrice)) {
      bot.sendMessage(chatId, '❌ Invalid price format');
      return;
    }

    // Get SOL price
    const solPrice = await getSOLPrice();
    if (!solPrice) {
      bot.sendMessage(chatId, '❌ Could not fetch SOL price');
      return;
    }

    // Get pool data
    const poolData = await getPoolData(poolAddress);
    
    // For DLMM pools, we need to get the token mint address
    let tokenSupply = null;
    let tokenMint = null;
    let tokenName = 'Token';
    let tokenSymbol = 'TOKEN';
    let binStep = null;
    let baseFee = null;

    if (poolData) {
      // Try different possible field names from Meteora API
      tokenMint = poolData.mintX || poolData.mint_x || poolData.baseMint || poolData.tokenMint;
      
      // Get pool parameters
      binStep = poolData.binStep || poolData.bin_step || poolData.binStepSize;
      baseFee = poolData.protocolFee || poolData.protocol_fee || poolData.baseFee || poolData.base_fee;
      
      // Get token name/symbol from pool data if available
      if (poolData.name || poolData.symbol || poolData.tokenXName || poolData.tokenXSymbol) {
        tokenName = poolData.name || poolData.tokenXName || 'Token';
        tokenSymbol = poolData.symbol || poolData.tokenXSymbol || poolData.tokenXName || 'TOKEN';
      }
      
      if (tokenMint) {
        tokenSupply = await getTokenSupply(tokenMint);
        
        // Try to get token metadata if not in pool data
        if (!tokenName || tokenName === 'Token') {
          const metadata = await getTokenMetadata(tokenMint);
          if (metadata) {
            tokenName = metadata.name || tokenName;
            tokenSymbol = metadata.symbol || tokenSymbol;
          }
        }
      }
    }

    // If we couldn't get from API, try to decode from blockchain
    if (!tokenMint || !tokenSupply) {
      try {
        const poolPubkey = new PublicKey(poolAddress);
        const accountInfo = await connection.getAccountInfo(poolPubkey);
        
        if (accountInfo && accountInfo.data) {
          // DLMM pool structure: mintX is typically at offset 8 (after discriminator)
          // This is a simplified approach - actual DLMM decoding would require the program IDL
          // For now, we'll ask user to provide supply if API fails
          if (!tokenSupply) {
            bot.sendMessage(chatId, 
              '⚠️ Could not automatically fetch token supply.\n\n' +
              'Please provide the token supply manually, or verify the pool address is correct.\n\n' +
              'You can find token supply on Solscan or other explorers.'
            );
            return;
          }
        }
      } catch (e) {
        console.error('Error fetching pool account:', e);
      }
    }

    if (!tokenSupply) {
      bot.sendMessage(chatId, '❌ Could not fetch token supply. Please verify the pool address or provide supply manually.');
      return;
    }

    // Calculate MCAP
    const mcapRange = calculateMCAPRange(minPrice, maxPrice, tokenSupply, solPrice);

    if (!mcapRange) {
      bot.sendMessage(chatId, '❌ Could not calculate MCAP range');
      return;
    }

    // Format pool parameters
    const poolParams = [];
    if (binStep !== null && binStep !== undefined) {
      poolParams.push(binStep);
    }
    if (baseFee !== null && baseFee !== undefined) {
      // Convert to percentage if it's a decimal (e.g., 0.025 -> 2.5%)
      const feePercent = baseFee < 1 ? (baseFee * 100).toFixed(1) : baseFee;
      poolParams.push(`${feePercent}%`);
    }
    const paramsStr = poolParams.length > 0 ? `, ${poolParams.join(', ')}` : '';
    
    // Format token pair name with token name (not symbol) and make it a hyperlink
    const pairNameText = `${tokenName}${paramsStr}`;
    const pairName = `[${pairNameText}](${poolUrl})`;
    
    // Format MCAP range
    const mcapRangeStr = `($${mcapRange.min.toLocaleString(undefined, {maximumFractionDigits: 0})} - $${mcapRange.max.toLocaleString(undefined, {maximumFractionDigits: 0})})`;
    
    // Format response
    const response = 
      `${pairName}\n\n` +
      `${mcapRangeStr}\n\n` +
      `📈 TradingView Lines:\n` +
      `\`\`\`\n${mcapRange.min}\n${mcapRange.max}\n\`\`\``;

    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error processing message:', error);
    bot.sendMessage(chatId, `❌ Error: ${error.message}`);
  }
  });
}

// Setup bot handlers (always, for both direct run and imports)
setupBotHandlers();

// Only start bot if running directly (not imported as module)
// In serverless environments, we skip auto-start and let the webhook handler manage it
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // Start bot based on mode
  if (WEBHOOK_URL) {
    // Webhook mode (for serverless/Vercel)
    bot.setWebHook(`${WEBHOOK_URL}/api/webhook`);
    console.log('🤖 Bot is running in webhook mode...');
  } else {
    // Polling mode (for traditional hosting)
    console.log('🤖 Bot is running in polling mode...');
  }
}

// Export for serverless functions
export { bot, setupBotHandlers };

