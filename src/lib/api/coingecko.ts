/**
 * CoinGecko API client for free-tier endpoints.
 * Rate limit: ~30 calls/min (public API).
 * Uses api.coingecko.com - no API key required for free tier.
 */

import type {
  CoinMarket,
  GlobalMarketData,
  MarketChartData,
  SearchResult,
  TrendingSearch,
  CoinDetail,
} from "./coingecko-types";

const BASE_URL = "https://api.coingecko.com/api/v3";

/** Thrown when CoinGecko rate limit (429) is exceeded */
export class CoinGeckoRateLimitError extends Error {
  readonly status = 429;

  constructor(message: string) {
    super(message);
    this.name = "CoinGeckoRateLimitError";
  }
}

/** Request config - extend for API key when using Demo/Pro tier */
const getHeaders = (): HeadersInit => ({
  Accept: "application/json",
  "User-Agent": "CryptoDashboard/1.0",
});

interface FetchOptions {
  /** ISR revalidate in seconds (default 60, use 300+ for less frequent data) */
  revalidate?: number;
}

async function fetchApi<T>(
  endpoint: string,
  params?: Record<string, string>,
  options?: FetchOptions
): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") url.searchParams.set(k, v);
    });
  }

  const revalidate = options?.revalidate ?? 60;

  const res = await fetch(url.toString(), {
    headers: getHeaders(),
    next: { revalidate },
  });

  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) {
      throw new CoinGeckoRateLimitError(
        "Rate limit exceeded. Please try again in a minute."
      );
    }
    throw new Error(`CoinGecko API error ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json() as Promise<T>;
}

/**
 * Fetch top coins with market data.
 * @param currency - vs_currency (e.g. usd)
 * @param perPage - results per page (1-250)
 * @param page - page number
 */
export async function getCoinsMarkets(
  currency = "usd",
  perPage = 50,
  page = 1,
  ids?: string
): Promise<CoinMarket[]> {
  const params: Record<string, string> = {
    vs_currency: currency,
    order: "market_cap_desc",
    per_page: String(perPage),
    page: String(page),
    sparkline: "true",
    price_change_percentage: "1h,24h,7d",
  };
  if (ids) params.ids = ids;

  return fetchApi<CoinMarket[]>("/coins/markets", params, { revalidate: ids ? 300 : 60 });
}

/**
 * Fetch global crypto market data.
 */
export async function getGlobalData(): Promise<GlobalMarketData> {
  return fetchApi<GlobalMarketData>("/global");
}

/**
 * Fetch historical market chart for a coin.
 * @param id - CoinGecko coin ID (e.g. bitcoin)
 * @param currency - vs_currency
 * @param days - 1, 7, 14, 30, 90, 180, 365, or "max"
 */
export async function getCoinMarketChart(
  id: string,
  currency = "usd",
  days: number | "max" = 7
): Promise<MarketChartData> {
  return fetchApi<MarketChartData>(`/coins/${encodeURIComponent(id)}/market_chart`, {
    vs_currency: currency,
    days: String(days),
  });
}

/**
 * Search coins, exchanges, categories.
 */
export async function searchCoins(query: string): Promise<SearchResult> {
  if (!query.trim()) return { coins: [], exchanges: [], icos: [], categories: [], nfts: [] };
  return fetchApi<SearchResult>("/search", { query: query.trim() });
}

/**
 * Fetch simple prices for multiple coins (lighter than coins/markets).
 * Use for trending page to reduce rate limit usage.
 */
export async function getSimplePrices(
  ids: string[],
  options?: { include24hChange?: boolean }
): Promise<Record<string, { usd?: number; usd_24h_change?: number }>> {
  if (ids.length === 0) return {};
  const params: Record<string, string> = {
    ids: ids.join(","),
    vs_currencies: "usd",
  };
  if (options?.include24hChange) params.include_24hr_change = "true";
  return fetchApi<Record<string, { usd?: number; usd_24h_change?: number }>>(
    "/simple/price",
    params,
    { revalidate: 300 }
  );
}

/**
 * Fetch trending coins (last 24h).
 * Uses longer cache (5 min) to reduce rate limit hits.
 */
export async function getTrendingCoins(): Promise<TrendingSearch> {
  return fetchApi<TrendingSearch>("/search/trending", undefined, { revalidate: 300 });
}

/**
 * Fetch full coin detail by ID.
 */
export async function getCoinById(id: string): Promise<CoinDetail> {
  return fetchApi<CoinDetail>(`/coins/${encodeURIComponent(id)}`, {
    localization: "false",
    tickers: "false",
    community_data: "false",
    developer_data: "false",
  });
}
