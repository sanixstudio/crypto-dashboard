"use client";

import type { GlobalMarketData } from "@/lib/api/coingecko-types";
import { formatCompact, formatPercent } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface GlobalStatsProps {
  data: GlobalMarketData;
  currency?: string;
}

/**
 * Global crypto market statistics card with market dominance.
 */
export function GlobalStats({ data, currency = "usd" }: GlobalStatsProps) {
  const d = data.data;
  const totalCap =
    (d.total_market_cap as Record<string, number>)?.[currency] ??
    d.total_market_cap?.usd ??
    0;
  const totalVol =
    (d.total_volume as Record<string, number>)?.[currency] ??
    d.total_volume?.usd ??
    0;
  const capChange = d.market_cap_change_percentage_24h_usd ?? 0;
  const volChange = d.volume_change_percentage_24h_usd ?? 0;
  const dominance = (d.market_cap_percentage ?? {}) as Record<string, number>;

  const DOMINANCE_COLORS: Record<string, string> = {
    btc: "#f7931a",
    eth: "#627eea",
    usdt: "#26a17b",
    bnb: "#f3ba2f",
    sol: "#9945ff",
    usdc: "#2775ca",
  };

  const dominanceData = ["btc", "eth", "usdt", "bnb", "sol", "usdc"]
    .filter((key) => dominance[key] != null)
    .map((key) => ({
      name: key.toUpperCase(),
      value: dominance[key],
      fill: DOMINANCE_COLORS[key] ?? "hsl(var(--muted))",
    }));

  const chartConfig: ChartConfig = Object.fromEntries(
    dominanceData.map((item) => [
      item.name,
      { label: item.name, color: item.fill },
    ]),
  );

  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
            Global Crypto Market
          </h3>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg p-4 transition-colors hover:bg-muted/30">
            <p className="text-2xl font-bold tabular-nums">
              {formatCompact(totalCap)}
            </p>
            <p className="text-xs text-muted-foreground">Total Market Cap</p>
            <p
              className={`text-xs ${capChange >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {formatPercent(capChange)} 24h
            </p>
          </div>
          <div className="rounded-lg p-4 transition-colors hover:bg-muted/30">
            <p className="text-2xl font-bold tabular-nums">
              {formatCompact(totalVol)}
            </p>
            <p className="text-xs text-muted-foreground">24h Volume</p>
            <p
              className={`text-xs ${volChange >= 0 ? "text-emerald-600" : "text-red-600"}`}
            >
              {formatPercent(volChange)} 24h
            </p>
          </div>
          <div className="rounded-lg p-4 transition-colors hover:bg-muted/30">
            <p className="text-2xl font-bold tabular-nums">
              {d.active_cryptocurrencies?.toLocaleString() ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              Active Cryptocurrencies
            </p>
          </div>
          <div className="rounded-lg p-4 transition-colors hover:bg-muted/30">
            <p className="text-2xl font-bold tabular-nums">
              {d.markets?.toLocaleString() ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">Markets</p>
          </div>
        </CardContent>
      </Card>

      {dominanceData.length > 0 && (
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              Market Dominance
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[280px] w-full"
              >
                <PieChart>
                  <Pie
                    data={dominanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                  >
                    {dominanceData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.fill}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={
                      <ChartTooltipContent
                        formatter={(value) => `${Number(value).toFixed(1)}%`}
                      />
                    }
                  />
                </PieChart>
              </ChartContainer>
              <div className="flex flex-wrap content-start gap-3">
                {dominanceData.map(({ name, value, fill }) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-muted/30"
                  >
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: fill }}
                    />
                    <span className="text-sm font-semibold uppercase tracking-wider">
                      {name}
                    </span>
                    <span className="text-sm font-mono tabular-nums text-muted-foreground">
                      {value.toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
