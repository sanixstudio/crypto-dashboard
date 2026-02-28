import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getTrendingCoins, getSimplePrices, CoinGeckoRateLimitError } from "@/lib/api/coingecko";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const revalidate = 300;

async function TrendingContent() {
  const trending = await getTrendingCoins();
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trending</h1>
        <p className="text-muted-foreground">Most searched coins in the last 24 hours</p>
      </div>
      {rateLimited && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
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
            <Link key={item.id} href={`/coin/${item.id}`}>
              <Card className="transition-colors hover:bg-accent/50 cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <Badge variant="secondary">{i + 1}</Badge>
                  <Image
                    src={item.large || item.thumb}
                    alt={item.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground uppercase">{item.symbol}</p>
                  </div>
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
