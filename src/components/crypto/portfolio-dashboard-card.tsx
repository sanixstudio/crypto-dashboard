import Link from "next/link";
import { getCoinsMarkets } from "@/lib/api/coingecko";
import { getHoldings } from "@/app/actions/portfolio";
import { getCurrency } from "@/app/actions/currency";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { formatPriceWithSymbol, formatPercent, cn } from "@/lib/utils";

/**
 * Compact portfolio summary for dashboard - total value and P&L.
 */
export async function PortfolioDashboardCard() {
  const [holdings, currency] = await Promise.all([
    getHoldings(),
    getCurrency(),
  ]);

  if (holdings.length === 0) return null;

  const coinIds = [...new Set(holdings.map((h) => h.coinId))].join(",");
  const coins = await getCoinsMarkets(currency, 250, 1, coinIds);
  const coinsMap = new Map(coins.map((c) => [c.id, c]));

  let totalValue = 0;
  let totalCost = 0;
  for (const h of holdings) {
    const coin = coinsMap.get(h.coinId);
    const price = coin?.current_price ?? 0;
    totalValue += h.amount * price;
    totalCost += h.costBasis ?? 0;
  }
  const totalPl = totalValue - totalCost;
  const totalPlPercent = totalCost > 0 ? (totalPl / totalCost) * 100 : null;

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 tracking-wide uppercase">
          <Wallet className="h-4 w-4" />
          Portfolio
        </h3>
        <Link href="/portfolio">
          <Button variant="ghost" size="sm">
            View all
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums">
          {formatPriceWithSymbol(totalValue, currency)}
        </p>
        {totalPlPercent != null && (
          <p
            className={cn(
              "mt-1 flex items-center gap-1 text-sm font-medium tabular-nums",
              totalPl >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-600 dark:text-red-400"
            )}
          >
            {totalPl >= 0 ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {formatPercent(totalPlPercent)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
