/**
 * CoinGecko API type definitions for free-tier endpoints.
 * @see https://docs.coingecko.com/
 */

/** Coin market data from /coins/markets endpoint */
export interface CoinMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number | null;
  market_cap: number | null;
  market_cap_rank: number | null;
  fully_diluted_valuation: number | null;
  total_volume: number | null;
  high_24h: number | null;
  low_24h: number | null;
  price_change_24h: number | null;
  price_change_percentage_24h: number | null;
  price_change_percentage_7d_in_currency?: number | null;
  market_cap_change_24h: number | null;
  market_cap_change_percentage_24h: number | null;
  circulating_supply: number | null;
  total_supply: number | null;
  max_supply: number | null;
  ath: number | null;
  ath_change_percentage: number | null;
  ath_date: string | null;
  atl: number | null;
  atl_change_percentage: number | null;
  atl_date: string | null;
  sparkline_in_7d?: { price: number[] } | null;
  last_updated: string;
}

/** Global market data from /global endpoint */
export interface GlobalMarketData {
  data: {
    active_cryptocurrencies: number;
    markets: number;
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
    market_cap_change_percentage_24h_usd: number;
    volume_change_percentage_24h_usd: number;
    updated_at: number;
  };
}

/** OHLC data from /coins/{id}/ohlc - [timestamp_ms, open, high, low, close] */
export type OHLCDataPoint = [number, number, number, number, number];
export type OHLCData = OHLCDataPoint[];

/** Market chart data from /coins/{id}/market_chart */
export interface MarketChartData {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

/** Search result from /search endpoint */
export interface SearchCoin {
  id: string;
  name: string;
  api_symbol: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  large: string;
}

export interface SearchResult {
  coins: SearchCoin[];
  exchanges: unknown[];
  icos: unknown[];
  categories: { id: string; name: string }[];
  nfts: unknown[];
}

/** Trending search item */
export interface TrendingCoin {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}

export interface TrendingSearch {
  coins: { item: TrendingCoin }[];
  exchanges: unknown[];
}

/** Coin detail links from /coins/{id} */
export interface CoinDetailLinks {
  homepage?: string[];
  whitepaper?: string;
  blockchain_site?: string[];
  official_forum_url?: string[];
  subreddit_url?: string;
  twitter_screen_name?: string;
  telegram_channel_identifier?: string;
  repos_url?: { github?: string[]; bitbucket?: string[] };
}

/** Category from /coins/categories/list */
export interface CategoryListItem {
  category_id: string;
  name: string;
}

/** Historical snapshot from /coins/{id}/history */
export interface CoinHistory {
  id: string;
  symbol: string;
  name: string;
  image: { thumb: string; small: string };
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    total_volume: Record<string, number>;
  };
}

/** Coin detail from /coins/{id} (full) */
export interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { thumb: string; small: string; large: string };
  links?: CoinDetailLinks;
  market_data: {
    current_price: Record<string, number>;
    market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    price_change_percentage_24h: number | null;
    price_change_percentage_7d: number | null;
    market_cap_change_percentage_24h: number | null;
    ath: Record<string, number>;
    ath_date?: Record<string, string>;
    atl: Record<string, number>;
    atl_date?: Record<string, string>;
    high_24h?: Record<string, number>;
    low_24h?: Record<string, number>;
  };
  description?: { en?: string };
}
