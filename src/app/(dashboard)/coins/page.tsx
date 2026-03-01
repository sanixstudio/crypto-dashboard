import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getCoinsMarkets } from "@/lib/api/coingecko";
import { getWatchlist } from "@/app/actions/watchlist";
import { getCurrency } from "@/app/actions/currency";
import { CoinCard } from "@/components/crypto/coin-card";
import { CoinsTable } from "@/components/crypto/coins-table";
import { CoinsViewToggle } from "@/components/crypto/coins-view-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const revalidate = 60;

const PER_PAGE = 24;

async function CoinsContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; view?: string }>;
}) {
  const { userId } = await auth();
  const currency = await getCurrency();
  const { page: pageParam, view: viewParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const view = viewParam === "table" ? "table" : "grid";

  const [coins, watchlist] = await Promise.all([
    getCoinsMarkets(currency, PER_PAGE, page),
    userId ? getWatchlist() : Promise.resolve([]),
  ]);

  const hasNext = coins.length === PER_PAGE;
  const hasPrev = page > 1;
  const watchlistSet = new Set(watchlist);
  const inWatchlist = (id: string) => watchlistSet.has(id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Top Coins</h1>
          <p className="mt-1 text-muted-foreground">
            Cryptocurrencies by market capitalization
          </p>
        </div>
        <CoinsViewToggle view={view} />
      </div>
      {view === "table" ? (
        <CoinsTable coins={coins} inWatchlist={inWatchlist} currency={currency} />
      ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {coins.map((coin) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            inWatchlist={inWatchlist(coin.id)}
            currency={currency}
          />
        ))}
      </div>
      )}
      <div className="flex items-center justify-between pt-2">
        <Button variant="outline" size="sm" className="rounded-lg" asChild disabled={!hasPrev}>
          <Link href={hasPrev ? `/coins?page=${page - 1}${view === "table" ? "&view=table" : ""}` : "#"}>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">Page {page}</span>
        <Button variant="outline" size="sm" className="rounded-lg" asChild disabled={!hasNext}>
          <Link href={hasNext ? `/coins?page=${page + 1}${view === "table" ? "&view=table" : ""}` : "#"}>
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
