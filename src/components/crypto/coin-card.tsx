import Image from "next/image";
import Link from "next/link";
import type { CoinMarket } from "@/lib/api/coingecko-types";
import { formatPrice, formatCompact, formatPercent, formatPriceWithSymbol, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { WatchlistButton } from "@/components/crypto/watchlist-button";
import { Sparkline } from "@/components/crypto/sparkline";

interface CoinCardProps {
  coin: CoinMarket;
  inWatchlist?: boolean;
  onWatchlistToggle?: () => void;
  /** Display currency for price formatting (default usd) */
  currency?: string;
}

/**
 * Card displaying coin market summary with link to detail.
 */
export function CoinCard({ coin, inWatchlist = false, onWatchlistToggle, currency = "usd" }: CoinCardProps) {
  const change24h = coin.price_change_percentage_24h ?? 0;
  const isPositive = change24h >= 0;

  return (
    <Link href={`/coin/${coin.id}`} className="block h-full group">
      <Card className="relative h-full cursor-pointer overflow-hidden border-border/60 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-accent/40 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Image
                src={coin.image}
                alt={coin.name}
                width={40}
                height={40}
                className="rounded-full ring-2 ring-border/50 transition-all duration-300 group-hover:ring-primary/30"
              />
            </div>
            <div>
              <p className="text-sm font-medium">{coin.name}</p>
              <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {coin.market_cap_rank != null && (
              <Badge variant="secondary" className="text-xs font-mono tabular-nums">
                #{coin.market_cap_rank}
              </Badge>
            )}
            <WatchlistButton
              coinId={coin.id}
              isInWatchlist={inWatchlist}
              onToggle={onWatchlistToggle}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xl font-bold tabular-nums">{formatPriceWithSymbol(coin.current_price, currency)}</p>
            <Sparkline
              data={coin.sparkline_in_7d?.price}
              positive={isPositive}
            />
          </div>
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
