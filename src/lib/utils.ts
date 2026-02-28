import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind classes with clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format large numbers for display (e.g. 1.2B, 500M).
 */
export function formatCompact(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  return num.toFixed(2);
}

/**
 * Format price with appropriate decimals.
 */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return "—";
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  if (price >= 0.0001) return price.toFixed(6);
  return price.toExponential(2);
}

/**
 * Format percentage with sign.
 */
export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "—";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/** Currency display symbols */
export const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: "$",
  eur: "€",
  gbp: "£",
};

/**
 * Format price with currency symbol.
 */
export function formatPriceWithSymbol(
  price: number | null | undefined,
  currency = "usd"
): string {
  if (price == null) return "—";
  const sym = CURRENCY_SYMBOLS[currency] ?? "$";
  const formatted = formatPrice(price);
  return formatted === "—" ? "—" : `${sym}${formatted}`;
}
