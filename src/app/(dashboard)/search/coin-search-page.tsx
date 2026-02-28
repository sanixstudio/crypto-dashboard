"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CoinCard } from "@/components/crypto/coin-card";
import type { CoinMarket } from "@/lib/api/coingecko-types";

/**
 * Full-page search - uses search API to find coins, then fetches market data.
 */
export function CoinSearchPage() {
  const [query, setQuery] = useState("");
  const [coins, setCoins] = useState<CoinMarket[] | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setCoins(null);
    try {
      const searchRes = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`).then((r) => r.json());
      const coinIds = (searchRes.coins ?? []).slice(0, 10).map((c: { id: string }) => c.id).join(",");
      if (!coinIds) {
        setCoins([]);
        return;
      }
      const marketRes = await fetch(`/api/coins?ids=${encodeURIComponent(coinIds)}`).then((r) => r.json());
      setCoins(Array.isArray(marketRes) ? marketRes : []);
    } catch {
      setCoins([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Search Coins</h1>
        <p className="text-muted-foreground">
          Search by name or symbol (e.g. Bitcoin, ETH, Solana)
        </p>
      </div>
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Bitcoin, Ethereum, Solana..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />
        <Button type="submit" disabled={loading}>
          <SearchIcon className="h-4 w-4" />
          Search
        </Button>
      </form>
      <Button variant="outline" onClick={() => router.push("/coins")}>
        Browse Top 50 Coins
      </Button>
      {loading && <p className="text-muted-foreground">Loading...</p>}
      {coins !== null && !loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {coins.length === 0 ? (
            <p className="text-muted-foreground">No coins found. Try &quot;Bitcoin&quot; or &quot;Ethereum&quot;.</p>
          ) : (
            coins.map((coin) => <CoinCard key={coin.id} coin={coin} />)
          )}
        </div>
      )}
    </div>
  );
}
