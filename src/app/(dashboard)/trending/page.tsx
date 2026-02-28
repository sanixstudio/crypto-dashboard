import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { getTrendingCoins, getCoinsMarkets } from "@/lib/api/coingecko";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60;

async function TrendingContent() {
  const trending = await getTrendingCoins();
  const ids = trending.coins.map((c) => c.item.id).join(",");
  const coins = ids ? await getCoinsMarkets("usd", 10, 1, ids) : [];

  const coinMap = new Map(coins.map((c) => [c.id, c]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Trending</h1>
        <p className="text-muted-foreground">Most searched coins in the last 24 hours</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trending.coins.map(({ item }, i) => {
          const market = coinMap.get(item.id);
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
                  {market ? (
                    <div className="text-sm">
                      <p className="font-semibold">
                        ${market.current_price?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 6,
                        }) ?? "—"}
                      </p>
                      <p className="text-muted-foreground">
                        {market.price_change_percentage_24h != null
                          ? `${market.price_change_percentage_24h >= 0 ? "+" : ""}${market.price_change_percentage_24h.toFixed(2)}% 24h`
                          : "—"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Loading price...</p>
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
