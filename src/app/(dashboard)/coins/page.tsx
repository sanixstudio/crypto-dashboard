import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getCoinsMarkets } from "@/lib/api/coingecko";
import { getWatchlist } from "@/app/actions/watchlist";
import { getCurrency } from "@/app/actions/currency";
import { CoinCard } from "@/components/crypto/coin-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const revalidate = 60;

const PER_PAGE = 24;

async function CoinsContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { userId } = await auth();
  const currency = await getCurrency();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);

  const [coins, watchlist] = await Promise.all([
    getCoinsMarkets(currency, PER_PAGE, page),
    userId ? getWatchlist() : Promise.resolve([]),
  ]);

  const hasNext = coins.length === PER_PAGE;
  const hasPrev = page > 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Top Coins</h1>
        <p className="text-muted-foreground">
          Cryptocurrencies by market capitalization
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {coins.map((coin) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            inWatchlist={watchlist.includes(coin.id)}
            currency={currency}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild disabled={!hasPrev}>
          <Link href={hasPrev ? `/coins?page=${page - 1}` : "#"}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button variant="outline" size="sm" asChild disabled={!hasNext}>
          <Link href={hasNext ? `/coins?page=${page + 1}` : "#"}>
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function CoinsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    }>
      <CoinsContent searchParams={searchParams} />
    </Suspense>
  );
}
