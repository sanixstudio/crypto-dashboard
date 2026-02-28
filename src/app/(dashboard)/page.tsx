import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getCoinsMarkets, getGlobalData } from "@/lib/api/coingecko";
import { getWatchlist } from "@/app/actions/watchlist";
import { GlobalStats } from "@/components/crypto/global-stats";
import { CoinCard } from "@/components/crypto/coin-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard home - SSR with ISR (60s revalidate).
 */
export const revalidate = 60;

async function DashboardContent() {
  const { userId } = await auth();
  const [globalData, coins, watchlist] = await Promise.all([
    getGlobalData(),
    getCoinsMarkets("usd", 12, 1),
    userId ? getWatchlist() : Promise.resolve([]),
  ]);

  const watchlistCoins =
    watchlist.length > 0
      ? (await getCoinsMarkets("usd", 20, 1, watchlist.join(",")))
          .filter((c) => watchlist.includes(c.id))
          .sort((a, b) => watchlist.indexOf(a.id) - watchlist.indexOf(b.id))
      : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Global market overview and top cryptocurrencies
        </p>
      </div>

      {!userId && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <strong>Sign in</strong> to save coins to your watchlist and track them across devices.
          </p>
          <Link href="/sign-in">
            <Button size="sm">Sign In</Button>
          </Link>
        </div>
      )}

      {userId && watchlistCoins.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Watchlist</h2>
            <Link href="/watchlist">
              <Button variant="ghost" size="sm">
                View all
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {watchlistCoins.slice(0, 4).map((coin) => (
              <CoinCard key={coin.id} coin={coin} inWatchlist />
            ))}
          </div>
        </div>
      )}

      <GlobalStats data={globalData} />
      <div>
        <h2 className="mb-4 text-lg font-semibold">Top Coins by Market Cap</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coins.map((coin) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              inWatchlist={watchlist.includes(coin.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}
