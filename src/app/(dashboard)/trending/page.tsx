import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { getTrendingCoins, getSimplePrices, CoinGeckoRateLimitError } from "@/lib/api/coingecko";
import { getWatchlist } from "@/app/actions/watchlist";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WatchlistButton } from "@/components/crypto/watchlist-button";

export const revalidate = 300;

async function TrendingContent() {
  const { userId } = await auth();
  const [trending, watchlist] = await Promise.all([
    getTrendingCoins(),
    userId ? getWatchlist() : Promise.resolve([]),
  ]);
  const ids = trending.coins.map((c) => c.item.id);
  let prices: Record<string, { usd?: number; usd_24h_change?: number }> = {};
  let rateLimited = false;

  try {
    prices = ids.length > 0
      ? await getSimplePrices(ids, { include24hChange: true })
      : {};
  } catch (err) {
    if (err instanceof CoinGeckoRateLimitError) {
      rateLimited = true;
    } else {
      throw err;
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Trending</h1>
        <p className="mt-1 text-muted-foreground">Most searched coins in the last 24 hours</p>
      </div>
      {rateLimited && (
        <Alert variant="default" className="rounded-xl border-amber-500/50 bg-amber-500/10">
          <AlertDescription>
            Rate limit reached. Prices will update when you refresh in a minute.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trending.coins.map(({ item }, i) => {
          const priceData = prices[item.id];
          const usd = priceData?.usd;
          const change24h = priceData?.usd_24h_change;

          return (
            <Link key={item.id} href={`/coin/${item.id}`} className="block h-full group">
              <Card className="h-full cursor-pointer overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-accent/40 hover:shadow-lg hover:shadow-primary/5">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Badge variant="secondary" className="font-mono tabular-nums">{i + 1}</Badge>
                  <Image
                    src={item.large || item.thumb}
                    alt={item.name}
                    width={44}
                    height={44}
                    className="rounded-full ring-2 ring-border/50"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">{item.symbol}</p>
                  </div>
                  <WatchlistButton
                    coinId={item.id}
                    isInWatchlist={watchlist.includes(item.id)}
                  />
                </CardHeader>
                <CardContent>
                  {usd != null ? (
                    <div className="text-sm">
                      <p className="font-semibold">
                        ${usd.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        })}
                      </p>
                      <p className="text-muted-foreground">
                        {change24h != null
                          ? `${change24h >= 0 ? "+" : ""}${change24h.toFixed(2)}% 24h`
                          : "—"}
                      </p>
                    </div>
                  ) : rateLimited ? (
                    <p className="text-sm text-muted-foreground">
                      {item.price_btc != null ? `฿${item.price_btc.toFixed(8)}` : "—"}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">—</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function TrendingPage() {
  return (
    <Suspense fallback={
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    }>
      <TrendingContent />
    </Suspense>
  );
}
