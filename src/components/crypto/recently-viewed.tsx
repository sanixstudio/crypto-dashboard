"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const STORAGE_KEY = "cryptodash-recently-viewed";
const MAX_ITEMS = 5;

interface RecentItem {
  id: string;
  name: string;
  symbol: string;
  image: string;
}

const EMPTY: RecentItem[] = [];

let cachedRaw: string | null = null;
let cachedValue: RecentItem[] = EMPTY;

function getSnapshot(): RecentItem[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? JSON.parse(raw) : EMPTY;
    return cachedValue;
  } catch {
    cachedRaw = null;
    cachedValue = EMPTY;
    return EMPTY;
  }
}

function subscribe(): () => void {
  return () => {};
}

/**
 * Records a coin view. Call from coin detail page.
 */
export function recordRecentlyViewed(item: RecentItem): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: RecentItem[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((x) => x.id !== item.id);
    const updated = [item, ...filtered].slice(0, MAX_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

/**
 * Client component showing recently viewed coins from localStorage.
 */
export function RecentlyViewed() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => []);

  if (items.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recently Viewed
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/coin/${item.id}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent/50"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={20}
                height={20}
                className="rounded-full"
              />
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground uppercase">{item.symbol}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
