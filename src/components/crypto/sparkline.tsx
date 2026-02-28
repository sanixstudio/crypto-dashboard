"use client";

import { useMemo, useId } from "react";
import { cn } from "@/lib/utils";

interface SparklineProps {
  /** Price data points (7d typically) */
  data: number[] | undefined | null;
  /** Whether the trend is positive (green) or negative (red) */
  positive?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

/**
 * Mini SVG sparkline for quick price trend visualization.
 * Uses a simple path with gradient fill.
 */
export function Sparkline({
  data,
  positive = true,
  className,
  width = 80,
  height = 28,
}: SparklineProps) {
  const { path, viewBox } = useMemo(() => {
    if (!data || data.length < 2) return { path: "", viewBox: `0 0 ${width} ${height}` };
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = 2;
    const stepX = (width - padding * 2) / (data.length - 1);
    const points = data.map((v, i) => {
      const x = padding + i * stepX;
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });
    const pathD = `M ${points.join(" L ")}`;
    return { path: pathD, viewBox: `0 0 ${width} ${height}` };
  }, [data, width, height]);

  const gradientId = useId();

  if (!data || data.length < 2) return null;

  const color = positive ? "#10b981" : "#ef4444"; // emerald-500 / red-500

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`${path} L ${width - 2},${height} L 2,${height} Z`}
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
}
