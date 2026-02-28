/**
 * User preferences stored in Clerk publicMetadata.
 * Used for watchlist and display preferences.
 */

export const SUPPORTED_CURRENCIES = ["usd", "eur", "gbp"] as const;
export type Currency = (typeof SUPPORTED_CURRENCIES)[number];

export interface UserPreferences {
  watchlist: string[];
  currency?: Currency;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  watchlist: [],
  currency: "usd",
};

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
  return { watchlist, currency };
}
