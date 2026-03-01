import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getHoldings } from "@/app/actions/portfolio";
import { getCurrency } from "@/app/actions/currency";
import { getCoinsMarkets } from "@/lib/api/coingecko";
import { PortfolioSummary } from "@/components/crypto/portfolio-summary";
import { HoldingRow } from "@/components/crypto/holding-row";
import { AddHoldingForm } from "@/components/crypto/add-holding-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet } from "lucide-react";

export const revalidate = 60;

async function PortfolioContent({
  addCoinId,
}: {
  addCoinId: string | null;
}) {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 py-16 text-center backdrop-blur-sm">
        <Wallet className="mb-4 h-12 w-12 text-primary/50" />
        <h2 className="text-lg font-semibold">Sign in to track your portfolio</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Add holdings manually and track your P&L. No wallet connection required.
        </p>
        <Link href="/sign-in">
          <Button className="mt-4 rounded-lg">Sign In</Button>
        </Link>
      </div>
    );
  }

  const [holdings, currency] = await Promise.all([
    getHoldings(),
    getCurrency(),
  ]);

  if (holdings.length === 0 && !addCoinId) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/30 py-16 text-center backdrop-blur-sm">
        <Wallet className="mb-4 h-12 w-12 text-primary/50" />
        <h2 className="text-lg font-semibold">Your portfolio is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Add holdings to track your crypto investments and see P&L at a glance.
        </p>
        <AddHoldingForm initialCoinId={addCoinId ?? undefined} defaultOpen={!!addCoinId} />
      </div>
    );
  }

  const coinIds = [...new Set(holdings.map((h) => h.coinId))].join(",");
  const coins = await getCoinsMarkets(currency, 250, 1, coinIds);
  const coinsMap = new Map(coins.map((c) => [c.id, c]));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="mt-1 text-muted-foreground">
            Track your holdings and P&L. Data is stored securely in your account.
          </p>
        </div>
        <AddHoldingForm initialCoinId={addCoinId ?? undefined} defaultOpen={!!addCoinId} />
      </div>

      <PortfolioSummary
        holdings={holdings}
        coinsMap={coinsMap}
        currency={currency}
      />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Holdings</h2>
        <div className="space-y-3">
          {holdings.map((holding) => (
            <HoldingRow
              key={holding.id}
              holding={holding}
              coin={coinsMap.get(holding.coinId) ?? null}
              currency={currency}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    </div>
  );
}

interface PortfolioPageProps {
  searchParams: Promise<{ add?: string }>;
}

export default async function PortfolioPage({ searchParams }: PortfolioPageProps) {
  const sp = await searchParams;
  const addCoinId = sp?.add?.trim() || null;
  return (
    <Suspense fallback={<PortfolioSkeleton />}>
      <PortfolioContent addCoinId={addCoinId} />
    </Suspense>
  );
}
