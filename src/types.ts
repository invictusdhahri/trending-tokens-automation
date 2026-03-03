export interface TrendingToken {
  objectID: string;
  address: string;
  name: string;
  symbol: string;
  price: string;
  rank: number;
  decimals: number;
  volume24hUSD: number;
  priceChange24h: number;
  logoURI: string | null;
  tags: string[];
  priorityTagCount: number;
  updatedAt: string;
  marketCap: number;
  codexMarketCap: number;
  codexCirculatingMarketCap: number;
  fdv: number;
  liquidity: number;
  liquidity24h: number;
  holdersCount: number;
  codexPrice: number;
  transactions24h: {
    buys: number;
    sells: number;
    buyers: number;
    sellers: number;
  };
  mintable: boolean;
  freezable: boolean;
  dex: string;
  poolAddress: string;
}

export interface FilteredToken {
  address: string;
  name: string;
  symbol: string;
  price: string;
  priceChange24h: number;
  marketCap: number;
  volume24hUSD: number;
  logoURI: string | null;
  rank: number;
}

export interface MoongateTokenResponse {
  success: boolean;
  data: {
    tokens: Array<{
      address: string;
      name: string;
      symbol: string;
      socialLinks: {
        twitter?: string | null;
        telegram?: string | null;
        website?: string | null;
        discord?: string | null;
        [key: string]: string | null | undefined;
      };
    }>;
  };
}

export interface TokenWithSocials extends FilteredToken {
  twitterHandle?: string;
}
