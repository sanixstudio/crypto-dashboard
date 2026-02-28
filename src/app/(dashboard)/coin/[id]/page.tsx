import { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCoinById, getCoinMarketChart } from "@/lib/api/coingecko";
import { PriceChart } from "@/components/crypto/price-chart";
import { formatPrice, formatCompact, formatPercent, cn } from "@/lib/utils";
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
    const [coin, chart7d, chart30d, chart90d] = await Promise.all([
      getCoinById(id),
      getCoinMarketChart(id, "usd", 7),
      getCoinMarketChart(id, "usd", 30),
      getCoinMarketChart(id, "usd", 90),
    ]);
    const md = coin.market_data;
    const price = md.current_price?.usd ?? null;
    const change24h = md.price_change_percentage_24h ?? 0;
    const change7d = md.price_change_percentage_7d ?? 0;

    return (
      <div className="space-y-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <Image
              src={coin.image.large}
              alt={coin.name}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{coin.name}</h1>
                <Badge variant="secondary" className="uppercase">{coin.symbol}</Badge>
              </div>
              <p className="text-2xl font-semibold mt-1">{formatPrice(price)}</p>
              <div className="flex gap-4 text-sm mt-1">
                <span className={cn(change24h >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {formatPercent(change24h)} 24h
                </span>
                <span className={cn(change7d >= 0 ? "text-emerald-600" : "text-red-600")}>
                  {formatPercent(change7d)} 7d
                </span>
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
            <ChartCard data={chart7d} />
          </TabsContent>
          <TabsContent value="30d">
            <ChartCard data={chart30d} />
          </TabsContent>
          <TabsContent value="90d">
            <ChartCard data={chart90d} />
          </TabsContent>
        </Tabs>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">Market Cap</p>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{formatCompact(md.market_cap?.usd ?? 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">24h Volume</p>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{formatCompact(md.total_volume?.usd ?? 0)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">All-Time High</p>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{formatPrice(md.ath?.usd)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <p className="text-sm text-muted-foreground">All-Time Low</p>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-semibold">{formatPrice(md.atl?.usd)}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}

function ChartCard({ data }: { data: { prices: [number, number][]; market_caps: [number, number][]; total_volumes: [number, number][] } }) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-medium">Price Chart (USD)</h3>
      </CardHeader>
      <CardContent>
        <PriceChart data={data} height={350} />
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
