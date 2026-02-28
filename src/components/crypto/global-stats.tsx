import type { GlobalMarketData } from "@/lib/api/coingecko-types";
import { formatCompact, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface GlobalStatsProps {
  data: GlobalMarketData;
}

/**
 * Global crypto market statistics card.
 */
export function GlobalStats({ data }: GlobalStatsProps) {
  const d = data.data;
  const totalCap = d.total_market_cap?.usd ?? 0;
  const totalVol = d.total_volume?.usd ?? 0;
  const capChange = d.market_cap_change_percentage_24h_usd ?? 0;
  const volChange = d.volume_change_percentage_24h_usd ?? 0;

  return (
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
  );
}
