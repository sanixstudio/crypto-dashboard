import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { getWatchlist } from "@/app/actions/watchlist";
import { getCoinsMarkets } from "@/lib/api/coingecko";
import { CoinCard } from "@/components/crypto/coin-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

export const revalidate = 60;

async function WatchlistContent() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
        <Star className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Sign in to use your watchlist</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Save your favorite coins and track them in one place. Your watchlist syncs across devices.
        </p>
        <Link href="/sign-in">
          <Button className="mt-4">Sign In</Button>
        </Link>
      </div>
    );
  }

  const watchlist = await getWatchlist();
  if (watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 py-16 text-center">
        <Star className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold">Your watchlist is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Click the star on any coin to add it here. Start by browsing top coins or searching.
        </p>
        <Link href="/coins">
          <Button variant="outline" className="mt-4">
            Browse Top Coins
          </Button>
        </Link>
      </div>
    );
  }

  const coins = await getCoinsMarkets("usd", 50, 1, watchlist.join(","));
  const ordered = watchlist
    .map((id) => coins.find((c) => c.id === id))
    .filter(Boolean) as typeof coins;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {ordered.map((coin) => (
        <CoinCard key={coin.id} coin={coin} inWatchlist />
      ))}
    </div>
  );
}

export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Watchlist</h1>
        <p className="text-muted-foreground">
          Your saved coins. Track prices and quick access your favorites.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        }
      >
        <WatchlistContent />
      </Suspense>
    </div>
  );
}
