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

/** Request config - extend for API key when using Demo/Pro tier */
const getHeaders = (): HeadersInit => ({
  Accept: "application/json",
  "User-Agent": "CryptoDashboard/1.0",
});

async function fetchApi<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null && v !== "") url.searchParams.set(k, v);
    });
  }

  const res = await fetch(url.toString(), {
    headers: getHeaders(),
    next: { revalidate: 60 }, // ISR: revalidate every 60s for dashboard
  });

  if (!res.ok) {
    const text = await res.text();
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

  return fetchApi<CoinMarket[]>("/coins/markets", params);
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
 * Fetch trending coins (last 24h).
 */
export async function getTrendingCoins(): Promise<TrendingSearch> {
  return fetchApi<TrendingSearch>("/search/trending");
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
