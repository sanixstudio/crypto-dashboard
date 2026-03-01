"use client";

import {
  Area,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MarketChartData } from "@/lib/api/coingecko-types";
import { formatPrice, formatCompact } from "@/lib/utils";

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
  volume: {
    label: "Volume",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig;

interface AreaVolumeChartProps {
  data: MarketChartData;
  currency: string;
  height?: number;
}

/**
 * Area chart for price with volume bars underneath.
 * Uses market_chart data (prices + total_volumes).
 */
export function AreaVolumeChart({
  data,
  currency,
  height = 350,
}: AreaVolumeChartProps) {
  const volByTime = new Map<number, number>();
  (data.total_volumes ?? []).forEach(([ts, v]) => volByTime.set(ts, v));

  const chartData = data.prices.map(([timestamp, price]) => {
    const vol = volByTime.get(timestamp) ?? 0;
    return {
      time: new Date(timestamp).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(data.prices.length > 30 ? { year: "2-digit" } : {}),
      }),
      price: Number(price),
      volume: Number(vol),
      fullTime: new Date(timestamp).toISOString(),
    };
  });

  const maxVolume = Math.max(...chartData.map((d) => d.volume), 1);

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="fillPriceArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-price)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-price)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="time"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <YAxis
          yAxisId="price"
          orientation="right"
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatPrice(v)}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          width={60}
        />
        <YAxis
          yAxisId="volume"
          orientation="left"
          hide
          domain={[0, maxVolume * 1.2]}
        />
        <Tooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => {
                if (name === "price") return formatPrice(Number(value));
                return formatCompact(Number(value));
              }}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullTime
                  ? new Date(payload[0].payload.fullTime).toLocaleString()
                  : ""
              }
            />
          }
        />
        <Bar
          yAxisId="volume"
          dataKey="volume"
          fill="hsl(var(--muted))"
          fillOpacity={0.3}
          radius={[2, 2, 0, 0]}
        />
        <Area
          yAxisId="price"
          type="monotone"
          dataKey="price"
          stroke="var(--color-price)"
          fill="url(#fillPriceArea)"
          strokeWidth={2}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
