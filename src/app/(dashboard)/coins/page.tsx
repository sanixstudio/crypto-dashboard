import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getCoinsMarkets } from "@/lib/api/coingecko";
import { getWatchlist } from "@/app/actions/watchlist";
import { CoinCard } from "@/components/crypto/coin-card";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60;

async function CoinsContent() {
  const { userId } = await auth();
  const [coins, watchlist] = await Promise.all([
    getCoinsMarkets("usd", 50, 1),
    userId ? getWatchlist() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Top Coins</h1>
        <p className="text-muted-foreground">Top 50 cryptocurrencies by market capitalization</p>
      </div>
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
  );
}

export default function CoinsPage() {
  return (
    <Suspense fallback={
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    }>
      <CoinsContent />
    </Suspense>
  );
}
