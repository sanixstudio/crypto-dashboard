import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  formatPriceWithSymbol,
  formatPercent,
  cn,
} from "@/lib/utils";
import type { Holding } from "@/lib/user-preferences";
import type { CoinMarket } from "@/lib/api/coingecko-types";
import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react";
import Link from "next/link";

interface PortfolioSummaryProps {
  holdings: Holding[];
  coinsMap: Map<string, CoinMarket>;
  currency: string;
}

/**
 * Summary cards for portfolio: total value, cost basis, P&L, and allocation.
 */
export function PortfolioSummary({
  holdings,
  coinsMap,
  currency,
}: PortfolioSummaryProps) {
  let totalValue = 0;
  let totalCost = 0;
  const byCoin: Record<string, { value: number; cost: number }> = {};

  for (const h of holdings) {
    const coin = coinsMap.get(h.coinId);
    const price = coin?.current_price ?? 0;
    const value = h.amount * price;
    const cost = h.costBasis ?? 0;
    totalValue += value;
    totalCost += cost;
    byCoin[h.coinId] = {
      value: (byCoin[h.coinId]?.value ?? 0) + value,
      cost: (byCoin[h.coinId]?.cost ?? 0) + cost,
    };
  }

  const totalPl = totalValue - totalCost;
  const totalPlPercent =
    totalCost > 0 ? (totalPl / totalCost) * 100 : null;

  const allocation = Object.entries(byCoin)
    .map(([coinId, { value }]) => ({ coinId, value }))
    .filter((a) => a.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <p className="text-sm font-medium text-muted-foreground">Total Value</p>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums">
            {formatPriceWithSymbol(totalValue, currency)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <p className="text-sm font-medium text-muted-foreground">Cost Basis</p>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold tabular-nums">
            {formatPriceWithSymbol(totalCost, currency)}
          </p>
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
          {totalPlPercent != null &&
            (totalPl >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ))}
        </CardHeader>
        <CardContent>
          <p
            className={cn(
              "text-2xl font-bold tabular-nums",
              totalPl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {formatPriceWithSymbol(totalPl, currency)}
          </p>
          {totalPlPercent != null && (
            <p
              className={cn(
                "text-sm",
                totalPl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {formatPercent(totalPlPercent)}
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <p className="text-sm font-medium text-muted-foreground">Top Holdings</p>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {allocation.length === 0 ? (
            <p className="text-sm text-muted-foreground">No holdings</p>
          ) : (
            <div className="space-y-1.5">
              {allocation.map(({ coinId, value }) => {
                const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
                const coin = coinsMap.get(coinId);
                const sym = coin?.symbol?.toUpperCase() ?? coinId.slice(0, 4);
                return (
                  <div
                    key={coinId}
                    className="flex items-center justify-between text-sm"
                  >
                    <Link
                      href={`/coin/${coinId}`}
                      className="font-medium hover:underline uppercase"
                    >
                      {sym}
                    </Link>
                    <span className="text-muted-foreground tabular-nums">
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
