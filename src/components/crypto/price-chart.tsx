"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MarketChartData } from "@/lib/api/coingecko-types";
import { formatPrice } from "@/lib/utils";

const chartConfig = {
  price: {
    label: "Price",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

interface PriceChartProps {
  data: MarketChartData;
  height?: number;
}

/**
 * Area chart for coin price history.
 */
export function PriceChart({ data, height = 300 }: PriceChartProps) {
  const chartData = data.prices.map(([timestamp, price]) => ({
    time: new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    price: Number(price.toFixed(2)),
    fullTime: new Date(timestamp).toISOString(),
  }));

  return (
    <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="fillPrice" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-price)"
              stopOpacity={0.4}
            />
            <stop
              offset="100%"
              stopColor="var(--color-price)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="time" axisLine={false} tickLine={false} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => formatPrice(v)}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => formatPrice(Number(value))}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.fullTime
                  ? new Date(payload[0].payload.fullTime).toLocaleString()
                  : ""
              }
            />
          }
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="var(--color-price)"
          fill="url(#fillPrice)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
