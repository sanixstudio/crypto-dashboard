"use server";

import { cookies } from "next/headers";
import { SUPPORTED_CURRENCIES, type Currency } from "@/lib/user-preferences";

const CURRENCY_COOKIE = "currency";

/**
 * Set the user's preferred display currency.
 * Persists to cookie for SSR data fetching.
 */
export async function setCurrency(value: Currency): Promise<void> {
  if (!SUPPORTED_CURRENCIES.includes(value)) return;
  const cookieStore = await cookies();
  cookieStore.set(CURRENCY_COOKIE, value, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}

/**
 * Read the user's preferred currency from cookies.
 * Use in server components for API calls and formatting.
 */
export async function getCurrency(): Promise<Currency> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CURRENCY_COOKIE)?.value;
  if (value && SUPPORTED_CURRENCIES.includes(value as Currency)) {
    return value as Currency;
  }
  return "usd";
}
