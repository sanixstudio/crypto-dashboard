"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleWatchlist } from "@/app/actions/watchlist";
import { cn } from "@/lib/utils";

interface WatchlistButtonProps {
  coinId: string;
  isInWatchlist: boolean;
  variant?: "icon" | "full";
  className?: string;
  /** Called after successful toggle - use to refetch watchlist in client components */
  onToggle?: () => void;
}

/**
 * Button to add/remove a coin from the watchlist.
 * Requires user to be signed in.
 */
export function WatchlistButton({
  coinId,
  isInWatchlist,
  variant = "icon",
  className,
  onToggle,
}: WatchlistButtonProps) {
  const [optimisticInList, setOptimisticInList] = useState<boolean | null>(null);
  const router = useRouter();
  const displayed = optimisticInList ?? isInWatchlist;

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOptimisticInList(!displayed);
    const result = await toggleWatchlist(coinId);
    setOptimisticInList(null);
    router.refresh();
    if (result.success) onToggle?.();
    if (!result.success && result.error === "Sign in required") {
      window.location.href = "/sign-in";
    }
  };

  return (
    <Button
      variant="ghost"
      size={variant === "icon" ? "icon" : "sm"}
      className={cn(
        "shrink-0",
        displayed && "text-amber-500 hover:text-amber-600",
        className
      )}
      onClick={handleClick}
      aria-label={displayed ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Star
        className={cn("h-4 w-4", displayed && "fill-current")}
      />
      {variant === "full" && (
        <span className="ml-1">
          {displayed ? "Saved" : "Save"}
        </span>
      )}
    </Button>
  );
}
