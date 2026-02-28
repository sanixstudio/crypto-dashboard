import { NextRequest, NextResponse } from "next/server";
import { getCoinHistory } from "@/lib/api/coingecko";

/** Public API allows only last 365 days */
const HISTORY_DAYS_LIMIT = 365;

function getMinAllowedDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - HISTORY_DAYS_LIMIT);
  return d.toISOString().slice(0, 10);
}

/**
 * API route for coin historical data.
 * Query: date=YYYY-MM-DD
 * Public API: dates within last 365 days only.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const date = request.nextUrl.searchParams.get("date");
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Missing or invalid date (use YYYY-MM-DD)" },
      { status: 400 }
    );
  }
  const minDate = getMinAllowedDate();
  if (date < minDate) {
    return NextResponse.json(
      {
        error: `Historical data is limited to the last ${HISTORY_DAYS_LIMIT} days. Please select a date on or after ${minDate}.`,
      },
      { status: 400 }
    );
  }
  try {
    const data = await getCoinHistory(id, date);
    return NextResponse.json(data);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch coin history";
    const isTimeRangeError =
      message.includes("401") || message.includes("time range");
    console.error("Coin history API error:", error);
    return NextResponse.json(
      {
        error: isTimeRangeError
          ? `Historical data is limited to the last ${HISTORY_DAYS_LIMIT} days. Please select a more recent date.`
          : "Failed to fetch coin history. Please try again later.",
      },
      { status: isTimeRangeError ? 400 : 500 }
    );
  }
}
