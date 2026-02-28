import type { GlobalMarketData } from "@/lib/api/coingecko-types";
import { formatCompact, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface GlobalStatsProps {
  data: GlobalMarketData;
  currency?: string;
}

/**
 * Global crypto market statistics card with market dominance.
 */
export function GlobalStats({ data, currency = "usd" }: GlobalStatsProps) {
  const d = data.data;
  const totalCap = (d.total_market_cap as Record<string, number>)?.[currency] ?? d.total_market_cap?.usd ?? 0;
  const totalVol = (d.total_volume as Record<string, number>)?.[currency] ?? d.total_volume?.usd ?? 0;
  const capChange = d.market_cap_change_percentage_24h_usd ?? 0;
  const volChange = d.volume_change_percentage_24h_usd ?? 0;
  const dominance = (d.market_cap_percentage ?? {}) as Record<string, number>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h3 className="text-sm font-medium text-muted-foreground">
            Global Crypto Market
          </h3>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-2xl font-bold">{formatCompact(totalCap)}</p>
            <p className="text-xs text-muted-foreground">Total Market Cap</p>
            <p className={`text-xs ${capChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatPercent(capChange)} 24h
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold">{formatCompact(totalVol)}</p>
            <p className="text-xs text-muted-foreground">24h Volume</p>
            <p className={`text-xs ${volChange >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatPercent(volChange)} 24h
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold">{d.active_cryptocurrencies?.toLocaleString() ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Active Cryptocurrencies</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{d.markets?.toLocaleString() ?? "—"}</p>
            <p className="text-xs text-muted-foreground">Markets</p>
          </div>
        </CardContent>
      </Card>

      {Object.keys(dominance).length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-sm font-medium text-muted-foreground">
              Market Dominance
            </h3>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {["btc", "eth", "usdt", "bnb", "sol", "usdc"].map(
                (key) =>
                  dominance[key] != null && (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-sm font-medium uppercase">{key}</span>
                      <span className="text-sm text-muted-foreground">
                        {dominance[key].toFixed(1)}%
                      </span>
                    </div>
                  )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
