import { NextRequest, NextResponse } from "next/server";
import { getCoinsMarkets } from "@/lib/api/coingecko";

/**
 * API route for coins by IDs - proxies to CoinGecko.
 * Query: ids=bitcoin,ethereum,solana
 */
export async function GET(request: NextRequest) {
  const ids = request.nextUrl.searchParams.get("ids");
  if (!ids?.trim()) {
    return NextResponse.json({ error: "Missing ids parameter" }, { status: 400 });
  }
  try {
    const coins = await getCoinsMarkets("usd", 50, 1, ids.trim());
    return NextResponse.json(coins);
  } catch (error) {
    console.error("Coins API error:", error);
    return NextResponse.json({ error: "Failed to fetch coins" }, { status: 500 });
  }
}
