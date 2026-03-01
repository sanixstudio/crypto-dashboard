"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { CoinMarket } from "@/lib/api/coingecko-types";
import { formatPriceWithSymbol, formatCompact, formatPercent, cn } from "@/lib/utils";
import { WatchlistButton } from "@/components/crypto/watchlist-button";
import { Sparkline } from "@/components/crypto/sparkline";

type SortKey = "market_cap_rank" | "price" | "change24h" | "market_cap";

interface CoinsTableProps {
  coins: CoinMarket[];
  inWatchlist: (id: string) => boolean;
  currency: string;
}

/**
 * Compact table view for coins list with sortable columns.
 */
export function CoinsTable({
  coins,
  inWatchlist,
  currency,
}: CoinsTableProps) {
  return (
    <div className="rounded-lg border border-border/60 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/30">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Coin</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Price</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">24h %</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">7d %</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Market Cap</th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground w-24">7D</th>
          </tr>
        </thead>
        <tbody>
          {coins.map((coin) => {
            const change24h = coin.price_change_percentage_24h ?? 0;
            const change7d = coin.price_change_percentage_7d_in_currency ?? 0;
            const isPositive = change24h >= 0;
            return (
              <tr
                key={coin.id}
                className="border-b border-border/40 transition-colors hover:bg-muted/20"
              >
                <td className="px-4 py-3 font-mono text-muted-foreground tabular-nums">
                  {coin.market_cap_rank ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/coin/${coin.id}`}
                      className="flex items-center gap-3 hover:opacity-80 min-w-0"
                    >
                      <Image
                        src={coin.image}
                        alt={coin.name}
                        width={28}
                        height={28}
                        className="rounded-full shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{coin.name}</p>
                        <p className="text-xs text-muted-foreground uppercase">{coin.symbol}</p>
                      </div>
                    </Link>
                    <WatchlistButton
                      coinId={coin.id}
                      isInWatchlist={inWatchlist(coin.id)}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums">
                  {formatPriceWithSymbol(coin.current_price, currency)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-medium tabular-nums",
                    isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatPercent(change24h)}
                </td>
                <td
                  className={cn(
                    "px-4 py-3 text-right font-medium tabular-nums",
                    (change7d ?? 0) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  )}
                >
                  {formatPercent(change7d)}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground tabular-nums">
                  {formatCompact(coin.market_cap ?? 0)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Sparkline
                    data={coin.sparkline_in_7d?.price}
                    positive={isPositive}
                    width={64}
                    height={28}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
