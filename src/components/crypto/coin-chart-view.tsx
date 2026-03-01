"use client";

import { useState, useEffect } from "react";
import { CandlestickChart } from "./candlestick-chart";
import { AreaVolumeChart } from "./area-volume-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, BarChart3, LineChart } from "lucide-react";
import type { OHLCData } from "@/lib/api/coingecko-types";
import type { MarketChartData } from "@/lib/api/coingecko-types";

const TIME_RANGES = [
  { label: "1D", days: "1" },
  { label: "7D", days: "7" },
  { label: "30D", days: "30" },
  { label: "90D", days: "90" },
  { label: "1Y", days: "365" },
  { label: "Max", days: "max" },
] as const;

type ChartType = "candlestick" | "area";
type ChartData = OHLCData | MarketChartData;

interface CoinChartViewProps {
  coinId: string;
  currency: string;
}

/**
 * Enhanced coin chart with type toggle (Candlestick/Area) and time range selector.
 * Fetches data client-side for flexibility.
 */
export function CoinChartView({ coinId, currency }: CoinChartViewProps) {
  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [days, setDays] = useState("7");
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const type = chartType === "candlestick" ? "ohlc" : "market";
    const url = `/api/coin/${encodeURIComponent(coinId)}/chart?days=${days}&type=${type}&currency=${currency}`;

    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError(null);
      }
    });

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load chart data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [coinId, currency, days, chartType]);

  const isOHLC = (d: ChartData): d is OHLCData =>
    Array.isArray(d) && d.length > 0 && Array.isArray(d[0]) && d[0].length === 5;
  const isMarketChart = (d: ChartData): d is MarketChartData =>
    d !== null &&
    typeof d === "object" &&
    "prices" in d &&
    Array.isArray((d as MarketChartData).prices);

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2">
        <div className="flex items-center gap-2">
          <Button
            variant={chartType === "candlestick" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType("candlestick")}
          >
            <BarChart3 className="mr-1.5 h-4 w-4" />
            Candlestick
          </Button>
          <Button
            variant={chartType === "area" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setChartType("area")}
          >
            <LineChart className="mr-1.5 h-4 w-4" />
            Area
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {TIME_RANGES.map(({ label, days: d }) => (
            <Button
              key={d}
              variant={days === d ? "secondary" : "ghost"}
              size="sm"
              className="h-8 px-2 text-xs"
              onClick={() => setDays(d)}
            >
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div
            className="flex items-center justify-center gap-2 text-muted-foreground"
            style={{ minHeight: 350 }}
          >
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading chart...
          </div>
        ) : error ? (
          <div
            className="flex items-center justify-center text-sm text-muted-foreground"
            style={{ minHeight: 350 }}
          >
            {error}
          </div>
        ) : data && isOHLC(data) ? (
          <CandlestickChart data={data} height={350} />
        ) : data && isMarketChart(data) ? (
          <AreaVolumeChart
            data={data}
            currency={currency}
            height={350}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
