import type { TrendingToken, FilteredToken } from './types.js';

const API_ENDPOINT = process.env.API_ENDPOINT || 'https://mg-api-moonsuite-staging.fly.dev/tokens/trending-tokens';

const DEFAULT_BLOCKED_SYMBOLS = [
  'SOL', 'JUP', 'bSOL', 'USDC', 'USDT', 
  'RAY', 'ORCA', 'mSOL', 'jitoSOL', 'stSOL', 'PYUSD', 'USDY'
];

function getBlockedSymbols(): string[] {
  const envBlocked = process.env.BLOCKED_SYMBOLS;
  if (envBlocked) {
    return envBlocked.split(',').map(s => s.trim().toUpperCase());
  }
  return DEFAULT_BLOCKED_SYMBOLS;
}

export async function fetchTrendingTokens(): Promise<TrendingToken[]> {
  try {
    const response = await fetch(API_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const tokens = await response.json() as TrendingToken[];
    
    if (!Array.isArray(tokens)) {
      throw new Error('API response is not an array');
    }
    
    return tokens;
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    throw error;
  }
}

export function filterAndRankTokens(tokens: TrendingToken[]): FilteredToken[] {
  const blockedSymbols = getBlockedSymbols();
  
  const filtered = tokens
    .filter(token => {
      if (token.priceChange24h <= 0) {
        return false;
      }
      
      if (blockedSymbols.includes(token.symbol.toUpperCase())) {
        return false;
      }
      
      if (!token.name || !token.symbol) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => b.priceChange24h - a.priceChange24h)
    .slice(0, 5)
    .map((token, index): FilteredToken => ({
      address: token.address,
      name: token.name,
      symbol: token.symbol,
      price: token.price,
      priceChange24h: token.priceChange24h,
      marketCap: token.marketCap,
      volume24hUSD: token.volume24hUSD,
      logoURI: token.logoURI,
      rank: index + 1
    }));
  
  return filtered;
}

export async function fetchAndFilterTokens(): Promise<FilteredToken[]> {
  console.log('Fetching trending tokens from API...');
  const tokens = await fetchTrendingTokens();
  console.log(`Fetched ${tokens.length} tokens`);
  
  console.log('Filtering and ranking tokens...');
  const filtered = filterAndRankTokens(tokens);
  console.log(`Found ${filtered.length} qualified tokens`);
  
  if (filtered.length === 0) {
    throw new Error('No tokens found after filtering');
  }
  
  return filtered;
}
