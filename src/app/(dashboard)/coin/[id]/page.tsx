import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import { getCoinById, getCoinOHLC } from "@/lib/api/coingecko";
import { getWatchlist } from "@/app/actions/watchlist";
import { getCurrency } from "@/app/actions/currency";
import { WatchlistButton } from "@/components/crypto/watchlist-button";
import { RecordCoinView } from "@/components/crypto/record-coin-view";
import { CoinDetailActions } from "@/components/crypto/coin-detail-actions";
import { CoinHistorySection } from "@/components/crypto/coin-history-section";
import { CandlestickChart } from "@/components/crypto/candlestick-chart";
import { formatPriceWithSymbol, formatCompact, formatPercent, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function CoinDetailContent({ id }: { id: string }) {
  try {
    const { userId } = await auth();
    const currency = await getCurrency();
    const [coin, ohlc7d, ohlc30d, ohlc90d, watchlist] = await Promise.all([
      getCoinById(id),
      getCoinOHLC(id, currency, 7),
      getCoinOHLC(id, currency, 30),
      getCoinOHLC(id, currency, 90),
      userId ? getWatchlist() : Promise.resolve([]),
    ]);
    const md = coin.market_data;
    const price = (md.current_price as Record<string, number>)?.[currency] ?? md.current_price?.usd ?? null;
    const change24h = md.price_change_percentage_24h ?? 0;
    const change7d = md.price_change_percentage_7d ?? 0;
    const marketCap = (md.market_cap as Record<string, number>)?.[currency] ?? md.market_cap?.usd ?? 0;
    const totalVolume = (md.total_volume as Record<string, number>)?.[currency] ?? md.total_volume?.usd ?? 0;
    const ath = (md.ath as Record<string, number>)?.[currency] ?? md.ath?.usd ?? null;
    const atl = (md.atl as Record<string, number>)?.[currency] ?? md.atl?.usd ?? null;
    const description = coin.description?.en;

    return (
      <div className="space-y-8">
        <RecordCoinView
          id={coin.id}
          name={coin.name}
          symbol={coin.symbol}
          image={coin.image.small}
        />
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              <Image
                src={coin.image.large}
                alt={coin.name}
                width={72}
                height={72}
                className="rounded-2xl ring-2 ring-border/50 shadow-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold tracking-tight">{coin.name}</h1>
                <Badge variant="secondary" className="uppercase font-mono">{coin.symbol}</Badge>
                <WatchlistButton
                  coinId={id}
                  isInWatchlist={watchlist.includes(id)}
                  variant="full"
                />
              </div>
              <p className="text-2xl font-semibold mt-1">{formatPriceWithSymbol(price, currency)}</p>
              <div className="flex gap-4 text-sm mt-1">
                <span className={cn(change24h >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {formatPercent(change24h)} 24h
                </span>
                <span className={cn(change7d >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {formatPercent(change7d)} 7d
                </span>
              </div>
              <div className="mt-3">
                <CoinDetailActions coinId={id} coinName={coin.name} links={coin.links} />
              </div>
            </div>
          </div>
        </div>
        <Tabs defaultValue="7d" className="space-y-4">
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
          <TabsContent value="7d">
            <ChartCard data={ohlc7d} currency={currency} />
          </TabsContent>
          <TabsContent value="30d">
            <ChartCard data={ohlc30d} currency={currency} />
          </TabsContent>
          <TabsContent value="90d">
            <ChartCard data={ohlc90d} currency={currency} />
          </TabsContent>
        </Tabs>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">Market Cap</p>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{formatCompact(marketCap)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">24h Volume</p>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{formatCompact(totalVolume)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">All-Time High</p>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{formatPriceWithSymbol(ath, currency)}</p>
            </CardContent>
          </Card>
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">All-Time Low</p>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{formatPriceWithSymbol(atl, currency)}</p>
            </CardContent>
          </Card>
        </div>

        {description && (
          <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <h3 className="text-sm font-medium">About {coin.name}</h3>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </CardContent>
          </Card>
        )}

        <Suspense fallback={null}>
          <CoinHistorySection
            coinId={id}
            coinName={coin.name}
            currency={currency}
          />
        </Suspense>
      </div>
    );
  } catch {
    notFound();
  }
}

function ChartCard({ data, currency }: { data: import("@/lib/api/coingecko-types").OHLCData; currency: string }) {
  const label = currency.toUpperCase();
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-sm font-medium">Price Chart ({label})</h3>
      </CardHeader>
      <CardContent>
        <CandlestickChart data={data} height={350} />
      </CardContent>
    </Card>
  );
}

export default async function CoinDetailPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    }>
      <CoinDetailContent id={id} />
    </Suspense>
  );
}
