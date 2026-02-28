import { NextRequest, NextResponse } from "next/server";
import { searchCoins } from "@/lib/api/coingecko";

/**
 * API route for coin search - proxies to CoinGecko to avoid CORS.
 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query?.trim()) {
    return NextResponse.json({ coins: [] });
  }
  try {
    const result = await searchCoins(query);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
