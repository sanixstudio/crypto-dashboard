"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { Search as SearchIcon, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import type { SearchCoin } from "@/lib/api/coingecko-types";
import { addHolding } from "@/app/actions/portfolio";
import { toast } from "sonner";

const DEBOUNCE_MS = 300;

interface AddHoldingFormProps {
  /** Pre-select this coin when opening (e.g. from coin detail page) */
  initialCoinId?: string;
  /** Open the sheet by default (e.g. when navigating with ?add=) */
  defaultOpen?: boolean;
}

/**
 * Sheet form to add a new holding to the portfolio.
 * Uses coin search with amount and optional cost basis.
 */
export function AddHoldingForm({
  initialCoinId,
  defaultOpen = false,
}: AddHoldingFormProps = {}) {
  const [open, setOpen] = useState(defaultOpen);
  const [coin, setCoin] = useState<SearchCoin | null>(null);
  const [initialFetched, setInitialFetched] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCoin[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setSearchOpen(!!v.trim());
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (v.trim()) {
      debounceRef.current = setTimeout(() => doSearch(v), DEBOUNCE_MS);
    } else {
      setResults([]);
    }
  };

  const handleSelectCoin = (c: SearchCoin) => {
    setCoin(c);
    setQuery("");
    setResults([]);
    setSearchOpen(false);
  };

  useEffect(() => {
    if (initialCoinId && open && !initialFetched) {
      setInitialFetched(true);
      fetch(`/api/search?q=${encodeURIComponent(initialCoinId)}`)
        .then((r) => r.json())
        .then((res) => {
          const found = (res.coins ?? []).find(
            (c: SearchCoin) => c.id === initialCoinId.toLowerCase()
          );
          if (found) setCoin(found);
        })
        .catch(() => {});
    }
  }, [initialCoinId, open, initialFetched]);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setCoin(null);
      setAmount("");
      setCostBasis("");
      setQuery("");
      setResults([]);
      setInitialFetched(false);
    }
    setOpen(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coin) {
      toast.error("Please select a coin");
      return;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    const cost = costBasis.trim() ? parseFloat(costBasis) : undefined;
    if (cost !== undefined && (isNaN(cost) || cost < 0)) {
      toast.error("Cost basis must be a positive number");
      return;
    }
    setSubmitting(true);
    const result = await addHolding(coin.id, amt, cost);
    setSubmitting(false);
    if (result.success) {
      toast.success(`Added ${amt} ${coin.symbol.toUpperCase()} to portfolio`);
      handleOpenChange(false);
    } else {
      toast.error(result.error);
    }
  };

  const showSearchPopover = searchOpen && query.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="gap-2 rounded-lg">
          <Plus className="h-4 w-4" />
          Add Holding
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Add Holding</SheetTitle>
          <SheetDescription>
            Manually track a coin in your portfolio. Add cost basis for P&L calculation.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
          <div className="space-y-2">
            <label htmlFor="coin" className="text-sm font-medium">
              Coin
            </label>
            <Popover open={showSearchPopover} onOpenChange={setSearchOpen} modal={false}>
              <PopoverAnchor asChild>
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="coin"
                    placeholder={coin ? `${coin.name} (${coin.symbol.toUpperCase()})` : "Search coins..."}
                    value={query}
                    onChange={handleSearchChange}
                    onFocus={() => query.trim() && setSearchOpen(true)}
                    className="pl-9"
                    readOnly={!!coin}
                  />
                  {coin && (
                    <button
                      type="button"
                      onClick={() => setCoin(null)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  )}
                  {loading && (
                    <Loader2 className="absolute right-10 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>
              </PopoverAnchor>
              <PopoverContent align="start" className="w-(--radix-popper-anchor-width) p-0">
                {results.length === 0 ? (
                  <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                    No results found
                  </div>
                ) : (
                  <ul className="max-h-[240px] overflow-auto p-1">
                    {results.map((c) => (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectCoin(c)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
                        >
                          <Image src={c.thumb} alt="" width={24} height={24} className="rounded-full" />
                          <span className="font-medium">{c.name}</span>
                          <span className="text-xs uppercase text-muted-foreground">{c.symbol}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label htmlFor="amount" className="text-sm font-medium">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              step="any"
              min="0"
              placeholder="0.0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="font-mono"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="costBasis" className="text-sm font-medium">
              Cost basis <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              id="costBasis"
              type="number"
              step="any"
              min="0"
              placeholder="Total amount paid"
              value={costBasis}
              onChange={(e) => setCostBasis(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Total amount you paid. Needed for P&L calculation.
            </p>
          </div>
          <Button type="submit" disabled={submitting || !coin}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Add to Portfolio"
            )}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
