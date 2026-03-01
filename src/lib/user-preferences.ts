/**
 * User preferences stored in Clerk publicMetadata.
 * Used for watchlist, portfolio, and display preferences.
 */

export const SUPPORTED_CURRENCIES = ["usd", "eur", "gbp"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

/** Single portfolio holding - manual entry. */
export interface Holding {
  id: string;
  coinId: string;
  amount: number;
  /** Total cost basis (amount paid) for P&L calculation. Optional - omit to track value only. */
  costBasis?: number;
}

export interface UserPreferences {
  watchlist: string[];
  currency?: Currency;
  holdings?: Holding[];
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  watchlist: [],
  currency: "usd",
  holdings: [],
};

function parseHolding(raw: unknown): Holding | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" ? o.id : null;
  const coinId = typeof o.coinId === "string" ? o.coinId : null;
  const amount = typeof o.amount === "number" && o.amount > 0 ? o.amount : null;
  if (!id || !coinId || !amount) return null;
  const costBasis =
    typeof o.costBasis === "number" && o.costBasis >= 0 ? o.costBasis : undefined;
  return { id, coinId, amount, costBasis };
}

export function parsePreferences(metadata: unknown): UserPreferences {
  if (!metadata || typeof metadata !== "object") return DEFAULT_PREFERENCES;
  const m = metadata as Record<string, unknown>;
  const watchlist = Array.isArray(m.watchlist)
    ? (m.watchlist as string[]).filter((id) => typeof id === "string")
    : [];
  const currency =
    typeof m.currency === "string" && SUPPORTED_CURRENCIES.includes(m.currency as Currency)
      ? (m.currency as Currency)
      : "usd";
  const holdings = Array.isArray(m.holdings)
    ? (m.holdings as unknown[])
        .map(parseHolding)
        .filter((h): h is Holding => h !== null)
    : [];
  return { watchlist, currency, holdings };
}
