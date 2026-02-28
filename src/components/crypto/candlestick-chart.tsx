"use client";

import { useEffect, useRef } from "react";
import { createChart, CandlestickSeries, ColorType } from "lightweight-charts";
import type { OHLCData } from "@/lib/api/coingecko-types";
import { useTheme } from "next-themes";

const UP_COLOR_LIGHT = "#22c55e";
const DOWN_COLOR_LIGHT = "#ef4444";
const UP_COLOR_DARK = "#22c55e";
const DOWN_COLOR_DARK = "#ef4444";
const CHART_BG_LIGHT = "#ffffff";
const CHART_BG_DARK = "rgba(20, 20, 20, 0.95)";
const TEXT_COLOR_LIGHT = "#64748b";
const TEXT_COLOR_DARK = "#94a3b8";
const GRID_COLOR_LIGHT = "rgba(0, 0, 0, 0.06)";
const GRID_COLOR_DARK = "rgba(255, 255, 255, 0.06)";

interface CandlestickChartProps {
  data: OHLCData;
  height?: number;
}

/**
 * Candlestick chart using TradingView Lightweight Charts.
 * Shows OHLC data with up (green) and down (red) candles.
 */
export function CandlestickChart({ data, height = 350 }: CandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ReturnType<typeof createChart> | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    if (!containerRef.current || !data?.length) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: isDark ? CHART_BG_DARK : CHART_BG_LIGHT },
        textColor: isDark ? TEXT_COLOR_DARK : TEXT_COLOR_LIGHT,
      },
      grid: {
        vertLines: { color: isDark ? GRID_COLOR_DARK : GRID_COLOR_LIGHT },
        horzLines: { color: isDark ? GRID_COLOR_DARK : GRID_COLOR_LIGHT },
      },
      width: containerRef.current.clientWidth,
      height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: "transparent",
      },
      rightPriceScale: {
        borderColor: "transparent",
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          labelBackgroundColor: isDark ? "#374151" : "#e2e8f0",
        },
        horzLine: {
          labelBackgroundColor: isDark ? "#374151" : "#e2e8f0",
        },
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: isDark ? UP_COLOR_DARK : UP_COLOR_LIGHT,
      downColor: isDark ? DOWN_COLOR_DARK : DOWN_COLOR_LIGHT,
      borderVisible: false,
      wickUpColor: isDark ? UP_COLOR_DARK : UP_COLOR_LIGHT,
      wickDownColor: isDark ? DOWN_COLOR_DARK : DOWN_COLOR_LIGHT,
    });

    const formattedData = data.map(([timestamp, open, high, low, close]) => ({
      time: Math.floor(timestamp / 1000) as import("lightweight-charts").UTCTimestamp,
      open: Number(open),
      high: Number(high),
      low: Number(low),
      close: Number(close),
    }));

    candlestickSeries.setData(formattedData);
    chart.timeScale().fitContent();

    chartRef.current = chart;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, [data, height, isDark]);

  if (!data?.length) {
    return (
      <div
        className="flex w-full items-center justify-center text-sm text-muted-foreground"
        style={{ height }}
      >
        No chart data available
      </div>
    );
  }

  return <div ref={containerRef} className="w-full" style={{ height }} />;
}
