import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getCoinsMarkets, getGlobalData } from "@/lib/api/coingecko";
import { getWatchlist } from "@/app/actions/watchlist";
import { getCurrency } from "@/app/actions/currency";
import { GlobalStats } from "@/components/crypto/global-stats";
import { CoinCard } from "@/components/crypto/coin-card";
import { RecentlyViewed } from "@/components/crypto/recently-viewed";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { formatPercent } from "@/lib/utils";

/**
 * Dashboard home - SSR with ISR (60s revalidate).
 */
export const revalidate = 60;

async function DashboardContent() {
  const { userId } = await auth();
  const currency = await getCurrency();
  const [globalData, coinsRaw, watchlist] = await Promise.all([
    getGlobalData(),
    getCoinsMarkets(currency, 50, 1),
    userId ? getWatchlist() : Promise.resolve([]),
  ]);

  const coins = coinsRaw;
  const gainers = [...coins]
    .filter((c) => c.price_change_percentage_24h != null)
    .sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0))
    .slice(0, 5);
  const losers = [...coins]
    .filter((c) => c.price_change_percentage_24h != null)
    .sort((a, b) => (a.price_change_percentage_24h ?? 0) - (b.price_change_percentage_24h ?? 0))
    .slice(0, 5);

  const watchlistCoins =
    watchlist.length > 0
      ? (await getCoinsMarkets(currency, 20, 1, watchlist.join(",")))
          .filter((c) => watchlist.includes(c.id))
          .sort((a, b) => watchlist.indexOf(a.id) - watchlist.indexOf(b.id))
      : [];

  const topCoins = coins.slice(0, 12);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Global market overview and top cryptocurrencies
        </p>
      </div>

      <RecentlyViewed />

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
              <CoinCard key={coin.id} coin={coin} inWatchlist currency={currency} />
            ))}
          </div>
        </div>
      )}

      <GlobalStats data={globalData} currency={currency} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Top Gainers 24h
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gainers.map((coin) => (
                <Link
                  key={coin.id}
                  href={`/coin/${coin.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/50"
                >
                  <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatPercent(coin.price_change_percentage_24h)}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Top Losers 24h
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {losers.map((coin) => (
                <Link
                  key={coin.id}
                  href={`/coin/${coin.id}`}
                  className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/50"
                >
                  <span className="font-medium">{coin.symbol.toUpperCase()}</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {formatPercent(coin.price_change_percentage_24h)}
                  </span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-1" />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">Top Coins by Market Cap</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {topCoins.map((coin) => (
            <CoinCard
              key={coin.id}
              coin={coin}
              inWatchlist={watchlist.includes(coin.id)}
              currency={currency}
            />
          ))}
        </div>
        <div className="mt-4">
          <Link href="/coins">
            <Button variant="outline">View All Coins</Button>
          </Link>
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
