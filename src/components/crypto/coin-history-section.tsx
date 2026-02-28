"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, Loader2, TriangleAlert } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatPriceWithSymbol, formatCompact } from "@/lib/utils";

interface CoinHistorySectionProps {
  coinId: string;
  coinName: string;
  currency: string;
}

/** Format YYYY-MM-DD for max date (yesterday - data lags ~35 min after UTC midnight) */
function getMaxDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Public API allows only last 365 days of historical data */
const HISTORY_DAYS_LIMIT = 365;

/** Min date - 365 days ago (CoinGecko public API limit) */
function getMinDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - HISTORY_DAYS_LIMIT);
  return d.toISOString().slice(0, 10);
}

/** Format default date (e.g. 30 days ago, within public API limit) */
function getDefaultDate(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 30);
  return d.toISOString().slice(0, 10);
}

/**
 * Client section for viewing coin historical snapshot.
 * Fetches /api/coin/[id]/history?date=YYYY-MM-DD
 */
export function CoinHistorySection({
  coinId,
  coinName,
  currency,
}: CoinHistorySectionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("history");
  const [date, setDate] = useState(dateParam ?? getDefaultDate());
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    price: number;
    marketCap: number;
    volume: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (targetDate: string) => {
    setLoading(true);
    setData(null);
    setError(null);
    router.replace(`/coin/${coinId}?history=${targetDate}`, { scroll: false });
    try {
      const res = await fetch(`/api/coin/${coinId}/history?date=${targetDate}`);
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = json.error ?? json.message ?? "Failed to fetch historical data";
        throw new Error(typeof msg === "string" ? msg : "Failed to fetch");
      }
      const md = json.market_data ?? {};
      const price = (md.current_price ?? {})[currency] ?? (md.current_price ?? {}).usd ?? 0;
      const marketCap = (md.market_cap ?? {})[currency] ?? (md.market_cap ?? {}).usd ?? 0;
      const volume = (md.total_volume ?? {})[currency] ?? (md.total_volume ?? {}).usd ?? 0;
      setData({ price, marketCap, volume });
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load historical data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateParam) {
      setDate(dateParam);
      fetchHistory(dateParam);
    }
  }, []); // Only run on mount when URL has history param

  const handleFetch = () => fetchHistory(date);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setDate(v);
    if (data) setData(null);
  };

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 tracking-wide uppercase">
          <Calendar className="h-4 w-4" />
          Historical Snapshot
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          View {coinName} price, market cap, and volume at a specific date (UTC 00:00).
        </p>
        <Alert
          variant="default"
          className="rounded-lg border-amber-500/60 bg-amber-500/15 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400"
        >
          <TriangleAlert className="size-4 shrink-0" />
          <AlertDescription className="text-amber-800 dark:text-amber-200 font-medium">
            Limited to last {HISTORY_DAYS_LIMIT} days — Public API supports historical data within the past year only.
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="history-date" className="mb-1 block text-xs text-muted-foreground">
              Date
            </label>
            <input
              id="history-date"
              type="date"
              value={date}
              max={getMaxDate()}
              min={getMinDate()}
              onChange={handleDateChange}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <Button
            onClick={handleFetch}
            disabled={loading}
            className="rounded-lg"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "View"
            )}
          </Button>
        </div>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </div>
        )}
        {error && !loading && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}
        {data && !loading && (
          <div className="grid gap-4 sm:grid-cols-3 rounded-lg border border-border/60 bg-muted/20 p-4">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatPriceWithSymbol(data.price, currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Market Cap</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatCompact(data.marketCap)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">24h Volume</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatCompact(data.volume)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
