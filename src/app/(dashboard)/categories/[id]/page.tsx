import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getCategoriesList, getCoinsMarkets } from "@/lib/api/coingecko";
import { getWatchlist } from "@/app/actions/watchlist";
import { getCurrency } from "@/app/actions/currency";
import { CoinCard } from "@/components/crypto/coin-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

async function CategoryCoinsContent({ categoryId }: { categoryId: string }) {
  const { userId } = await auth();
  const currency = await getCurrency();
  const [categories, coins, watchlist] = await Promise.all([
    getCategoriesList(),
    getCoinsMarkets(currency, 50, 1, undefined, categoryId),
    userId ? getWatchlist() : Promise.resolve([]),
  ]);

  const category = categories.find((c) => c.category_id === categoryId);
  if (!category) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/categories">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to categories
          </Button>
        </Link>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">{category.name}</h1>
        <p className="mt-1 text-muted-foreground">
          Top coins in this category
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
    </div>
  );
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        </div>
      }
    >
      <CategoryCoinsContent categoryId={id} />
    </Suspense>
  );
}
