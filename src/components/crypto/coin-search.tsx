"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SearchCoin } from "@/lib/api/coingecko-types";
import Image from "next/image";

const DEBOUNCE_MS = 300;

/**
 * Client-side coin search with debounce and dropdown results.
 */
export function CoinSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCoin[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`).then((r) => r.json());
      setResults((res.coins ?? []).slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setOpen(!!v.trim());
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim()) {
      debounceRef.current = setTimeout(() => doSearch(v), DEBOUNCE_MS);
    } else {
      setResults([]);
    }
  };

  const handleSelect = (id: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/coin/${id}`);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div className="relative flex w-full max-w-sm items-center">
          <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search coins..."
            value={query}
            onChange={handleChange}
            onFocus={() => results.length > 0 && setOpen(true)}
            className="pl-9 pr-9"
          />
          {loading && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        {results.length === 0 && query.trim() && !loading && (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            No results found
          </div>
        )}
        {results.map((coin) => (
          <DropdownMenuItem
            key={coin.id}
            onClick={() => handleSelect(coin.id)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Image
              src={coin.thumb}
              alt={coin.name}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span className="font-medium">{coin.name}</span>
            <span className="text-muted-foreground text-xs uppercase">{coin.symbol}</span>
            {coin.market_cap_rank != null && (
              <span className="ml-auto text-xs text-muted-foreground">#{coin.market_cap_rank}</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
