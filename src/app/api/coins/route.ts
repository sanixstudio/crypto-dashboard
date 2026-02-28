import { NextRequest, NextResponse } from "next/server";
import { getCoinsMarkets } from "@/lib/api/coingecko";
import { getCurrency } from "@/app/actions/currency";

/**
 * API route for coins by IDs - proxies to CoinGecko.
 * Query: ids=bitcoin,ethereum,solana
 * Uses currency from cookie for display.
 */
export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids?.trim()) {
    return NextResponse.json({ error: "Missing ids parameter" }, { status: 400 });
  }
  try {
    const currency = await getCurrency();
    const coins = await getCoinsMarkets(currency, 50, 1, ids.trim());
    return NextResponse.json({ coins, currency });
  } catch (error) {
    console.error("Coins API error:", error);
    return NextResponse.json({ error: "Failed to fetch coins" }, { status: 500 });
  }
}
