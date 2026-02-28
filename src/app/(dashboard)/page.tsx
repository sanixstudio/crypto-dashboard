import { Suspense } from "react";
import { getCoinsMarkets, getGlobalData } from "@/lib/api/coingecko";
import { GlobalStats } from "@/components/crypto/global-stats";
import { CoinCard } from "@/components/crypto/coin-card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Dashboard home - SSR with ISR (60s revalidate).
 */
export const revalidate = 60;

async function DashboardContent() {
  const [globalData, coins] = await Promise.all([
    getGlobalData(),
    getCoinsMarkets("usd", 12, 1),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Global market overview and top cryptocurrencies</p>
      </div>
      <GlobalStats data={globalData} />
      <div>
        <h2 className="mb-4 text-lg font-semibold">Top Coins by Market Cap</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coins.map((coin) => (
            <CoinCard key={coin.id} coin={coin} />
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
