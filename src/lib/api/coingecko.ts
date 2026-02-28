/**
 * CoinGecko API client for free-tier endpoints.
 * Uses api.coingecko.com with optional Demo API key for better rate limits.
 * @see https://www.coingecko.com/en/developers/dashboard
 */

import queryString from "query-string";
import type {
  CoinMarket,
  CoinHistory,
  CategoryListItem,
  GlobalMarketData,
  MarketChartData,
  OHLCData,
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

/** Demo API key from env - improves rate limits vs public API */
function getApiKey(): string | undefined {
  return process.env.COINGECKO_API_KEY?.trim() || undefined;
}

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
  const apiKey = getApiKey();
  const allParams: Record<string, string> = {
    ...params,
    ...(apiKey && { x_cg_demo_api_key: apiKey }),
  };
  const filtered = Object.fromEntries(
    Object.entries(allParams).filter(([, v]) => v != null && v !== "")
  ) as Record<string, string>;
  const search = queryString.stringify(filtered);
  const url = `${BASE_URL}${endpoint}${search ? `?${search}` : ""}`;

  const revalidate = options?.revalidate ?? 60;

  const res = await fetch(url, {
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
 * @param ids - comma-separated coin IDs to filter
 * @param category - category ID from /coins/categories/list
 */
export async function getCoinsMarkets(
  currency = "usd",
  perPage = 50,
  page = 1,
  ids?: string,
  category?: string
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
  if (category) params.category = category;

  return fetchApi<CoinMarket[]>("/coins/markets", params, {
    revalidate: ids || category ? 300 : 60,
  });
}

/**
 * Fetch global crypto market data.
 */
export async function getGlobalData(): Promise<GlobalMarketData> {
  return fetchApi<GlobalMarketData>("/global");
}

/**
 * Fetch OHLC (candlestick) data for a coin.
 * @param id - CoinGecko coin ID
 * @param currency - vs_currency
 * @param days - 1, 7, 14, 30, 90, 180, 365, or "max"
 */
export async function getCoinOHLC(
  id: string,
  currency = "usd",
  days: number | "max" = 7
): Promise<OHLCData> {
  return fetchApi<OHLCData>(`/coins/${encodeURIComponent(id)}/ohlc`, {
    vs_currency: currency,
    days: String(days),
  }, { revalidate: 60 });
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

/**
 * Fetch list of coin categories.
 * Use category_id with getCoinsMarkets(category) to filter by category.
 */
export async function getCategoriesList(): Promise<CategoryListItem[]> {
  return fetchApi<CategoryListItem[]>("/coins/categories/list", undefined, {
    revalidate: 300,
  });
}

/**
 * Fetch historical market data for a coin at a specific date.
 * @param id - CoinGecko coin ID
 * @param date - Date in YYYY-MM-DD format (UTC 00:00 snapshot)
 */
export async function getCoinHistory(
  id: string,
  date: string
): Promise<CoinHistory> {
  return fetchApi<CoinHistory>(
    `/coins/${encodeURIComponent(id)}/history`,
    { date, localization: "false" },
    { revalidate: 86400 }
  );
}
