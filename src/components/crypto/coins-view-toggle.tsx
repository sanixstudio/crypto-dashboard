"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ViewMode = "grid" | "table";

interface CoinsViewToggleProps {
  view: ViewMode;
}

/**
 * Toggle between grid (cards) and table view for coins list.
 * Uses URL search param ?view=table|grid.
 */
export function CoinsViewToggle({ view }: CoinsViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setView = (v: ViewMode) => {
    const params = new URLSearchParams(searchParams.toString());
    if (v === "grid") {
      params.delete("view");
    } else {
      params.set("view", v);
    }
    const q = params.toString();
    router.push(q ? `/coins?${q}` : "/coins", { scroll: false });
  };

  return (
    <div className="flex rounded-lg border border-border/60 p-0.5">
      <Button
        variant={view === "grid" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-3"
        onClick={() => setView("grid")}
      >
        <LayoutGrid className="mr-1.5 h-4 w-4" />
        Cards
      </Button>
      <Button
        variant={view === "table" ? "secondary" : "ghost"}
        size="sm"
        className="h-8 px-3"
        onClick={() => setView("table")}
      >
        <List className="mr-1.5 h-4 w-4" />
        Table
      </Button>
    </div>
  );
}
