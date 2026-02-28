import Image from "next/image";
import Link from "next/link";
import type { CoinMarket } from "@/lib/api/coingecko-types";
import { formatPrice, formatCompact, formatPercent, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CoinCardProps {
  coin: CoinMarket;
}

/**
 * Card displaying coin market summary with link to detail.
 */
export function CoinCard({ coin }: CoinCardProps) {
  const change24h = coin.price_change_percentage_24h ?? 0;
  const isPositive = change24h >= 0;

  return (
    <Link href={`/coin/${coin.id}`}>
      <Card className="transition-colors hover:bg-accent/50 cursor-pointer h-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Image
              src={coin.image}
              alt={coin.name}
              width={32}
              height={32}
              className="rounded-full"
            />
            <div>
              <p className="text-sm font-medium">{coin.name}</p>
              <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
            </div>
          </div>
          {coin.market_cap_rank != null && (
            <Badge variant="secondary" className="text-xs">
              #{coin.market_cap_rank}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{formatPrice(coin.current_price)}</p>
          <div className="mt-2 flex items-center gap-1 text-sm">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={cn(isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
              {formatPercent(change24h)}
            </span>
            <span className="text-muted-foreground">24h</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            MCap: {formatCompact(coin.market_cap ?? 0)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
