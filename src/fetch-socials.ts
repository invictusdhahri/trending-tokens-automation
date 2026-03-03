import type { FilteredToken, TokenWithSocials, MoongateTokenResponse } from './types.js';

const MOONGATE_API_BASE = 'https://wallet.moongate.one/api/tokens/search';

function extractTwitterHandle(twitterUrl: string | null | undefined): string | undefined {
  if (!twitterUrl) return undefined;
  
  try {
    // Extract handle from URLs like:
    // https://x.com/pippinlovesyou
    // https://twitter.com/pippinlovesyou
    // https://x.com/pippinlovesyou"
    const cleanUrl = twitterUrl.replace(/["']/g, '').trim();
    const match = cleanUrl.match(/(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)/i);
    if (match && match[1] && match[1].length > 1) {
      // Filter out single character handles as they're likely invalid
      return match[1];
    }
  } catch (error) {
    console.warn(`Failed to extract Twitter handle from: ${twitterUrl}`, error);
  }
  
  return undefined;
}

async function fetchTokenSocials(address: string): Promise<string | undefined> {
  try {
    const url = new URL(MOONGATE_API_BASE);
    url.searchParams.set('q', address);
    url.searchParams.set('exactMatch', 'true');
    url.searchParams.set('limit', '1');
    url.searchParams.set('offset', '0');
    url.searchParams.set('excludeScam', 'true');
    url.searchParams.set('sortBy', 'circulatingMarketCap');
    url.searchParams.set('sortDirection', 'desc');
    url.searchParams.set('predefinedFilters', JSON.stringify(['BASE', 'SEARCH_QUALITY']));
    
    const response = await fetch(url.toString());
    if (!response.ok) {
      console.warn(`Failed to fetch socials for ${address}: ${response.status}`);
      return undefined;
    }
    
    const data = await response.json() as MoongateTokenResponse;
    
    if (data.success && data.data.tokens.length > 0) {
      const token = data.data.tokens[0];
      return extractTwitterHandle(token.socialLinks.twitter);
    }
  } catch (error) {
    console.warn(`Error fetching socials for ${address}:`, error);
  }
  
  return undefined;
}

export async function enrichTokensWithSocials(tokens: FilteredToken[]): Promise<TokenWithSocials[]> {
  console.log('Fetching Twitter handles for tokens...');
  
  const enrichedTokens: TokenWithSocials[] = [];
  
  for (const token of tokens) {
    const twitterHandle = await fetchTokenSocials(token.address);
    enrichedTokens.push({
      ...token,
      twitterHandle
    });
    
    if (twitterHandle) {
      console.log(`  ✓ ${token.symbol}: @${twitterHandle}`);
    } else {
      console.log(`  - ${token.symbol}: No Twitter handle found`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`Enriched ${enrichedTokens.filter(t => t.twitterHandle).length}/${tokens.length} tokens with Twitter handles`);
  
  return enrichedTokens;
}
