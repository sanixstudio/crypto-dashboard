"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { SearchCoin } from "@/lib/api/coingecko-types";
import Image from "next/image";

const DEBOUNCE_MS = 300;

/**
 * Client-side coin search with debounce and dropdown results.
 * Uses Popover (not DropdownMenu) so the input keeps focus while typing.
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
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`).then(
        (r) => r.json()
      );
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

  const handleFocus = () => {
    if (query.trim()) setOpen(true);
  };

  const handleSelect = (id: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/coin/${id}`);
  };

  const showPopover = open && query.trim().length > 0;

  return (
    <Popover open={showPopover} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor asChild>
        <div className="relative flex w-full max-w-sm items-center">
          <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search coins..."
            value={query}
            onChange={handleChange}
            onFocus={handleFocus}
            className="pl-9 pr-9"
            aria-autocomplete="list"
            aria-expanded={showPopover}
          />
          {loading && (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-muted-foreground pointer-events-none" />
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popper-anchor-width)] min-w-64 p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {loading ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            Searching...
          </div>
        ) : results.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No results found
          </div>
        ) : (
          <ul className="max-h-[300px] overflow-auto p-1">
            {results.map((coin) => (
              <li key={coin.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(coin.id)}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
                >
                  <Image
                    src={coin.thumb}
                    alt=""
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="font-medium">{coin.name}</span>
                  <span className="text-xs uppercase text-muted-foreground">
                    {coin.symbol}
                  </span>
                  {coin.market_cap_rank != null && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      #{coin.market_cap_rank}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
