import { NextRequest } from "next/server";
import { getCoinOHLC, getCoinMarketChart } from "@/lib/api/coingecko";

const VALID_DAYS = ["1", "7", "14", "30", "90", "180", "365", "max"] as const;

/**
 * GET /api/coin/[id]/chart?days=7&type=ohlc|market
 * Returns chart data for candlestick (OHLC) or area/line (market_chart with prices + volumes).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const daysParam = searchParams.get("days") ?? "7";
  const type = searchParams.get("type") ?? "ohlc";
  const currency = searchParams.get("currency") ?? "usd";

  if (!id) {
    return Response.json({ error: "Coin ID required" }, { status: 400 });
  }

  const days = VALID_DAYS.includes(daysParam as (typeof VALID_DAYS)[number])
    ? daysParam === "max"
      ? ("max" as const)
      : (parseInt(daysParam, 10) as 1 | 7 | 14 | 30 | 90 | 180 | 365)
    : 7;

  try {
    if (type === "market") {
      const data = await getCoinMarketChart(id, currency, days);
      return Response.json(data);
    }
    const data = await getCoinOHLC(id, currency, days);
    return Response.json(data);
  } catch (err) {
    console.error("Chart API error:", err);
    return Response.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
