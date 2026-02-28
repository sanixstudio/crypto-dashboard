import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getWatchlist } from "@/app/actions/watchlist";

/**
 * GET /api/watchlist - Returns the current user's watchlist (for client components).
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ watchlist: [] });
  }
  const watchlist = await getWatchlist();
  return NextResponse.json({ watchlist });
}
