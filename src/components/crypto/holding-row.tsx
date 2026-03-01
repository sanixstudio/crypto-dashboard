"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  formatPriceWithSymbol,
  formatPercent,
  formatCompact,
  cn,
} from "@/lib/utils";
import type { Holding } from "@/lib/user-preferences";
import type { CoinMarket } from "@/lib/api/coingecko-types";
import { updateHolding, removeHolding } from "@/app/actions/portfolio";
import { toast } from "sonner";

interface HoldingRowProps {
  holding: Holding;
  coin: CoinMarket | null;
  currency: string;
}

/**
 * Row displaying a single holding with current value and P&L.
 * Supports inline edit and delete.
 */
export function HoldingRow({ holding, coin, currency }: HoldingRowProps) {
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(holding.amount));
  const [costBasis, setCostBasis] = useState(
    holding.costBasis != null ? String(holding.costBasis) : ""
  );
  const [submitting, setSubmitting] = useState(false);

  const price = coin?.current_price ?? null;
  const currentValue = price != null ? holding.amount * price : null;
  const cost = holding.costBasis;
  const pl = cost != null && currentValue != null ? currentValue - cost : null;
  const plPercent =
    cost != null && cost > 0 && pl != null ? (pl / cost) * 100 : null;

  const handleSave = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    const cb = costBasis.trim() ? parseFloat(costBasis) : undefined;
    if (cb !== undefined && (isNaN(cb) || cb < 0)) {
      toast.error("Cost basis must be a positive number");
      return;
    }
    setSubmitting(true);
    const result = await updateHolding(holding.id, { amount: amt, costBasis: cb });
    setSubmitting(false);
    if (result.success) {
      toast.success("Holding updated");
      setEditing(false);
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove this holding?")) return;
    setSubmitting(true);
    const result = await removeHolding(holding.id);
    setSubmitting(false);
    if (result.success) {
      toast.success("Holding removed");
    } else {
      toast.error(result.error);
    }
  };

  const displayName = coin?.name ?? holding.coinId;
  const displaySymbol = coin?.symbol?.toUpperCase() ?? holding.coinId.toUpperCase();
  const image = coin?.image ?? `https://assets.coingecko.com/coins/images/1/small/bitcoin.png`;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-card/80 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Image
          src={image}
          alt={displayName}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <Link
            href={`/coin/${holding.coinId}`}
            className="font-medium hover:underline"
          >
            {displayName}
          </Link>
          <p className="text-xs text-muted-foreground uppercase">{displaySymbol}</p>
        </div>
      </div>
      {editing ? (
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Amount</label>
            <Input
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-9 w-24 font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Cost basis</label>
            <Input
              type="number"
              step="any"
              min="0"
              value={costBasis}
              onChange={(e) => setCostBasis(e.target.value)}
              placeholder="Optional"
              className="h-9 w-28 font-mono"
            />
          </div>
          <div className="flex gap-1">
            <Button size="sm" onClick={handleSave} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setAmount(String(holding.amount));
                setCostBasis(
                  holding.costBasis != null ? String(holding.costBasis) : ""
                );
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col items-end gap-0.5 text-sm">
            <p className="font-mono tabular-nums">
              {holding.amount} {displaySymbol}
            </p>
            <p className="font-semibold tabular-nums">
              {currentValue != null
                ? formatPriceWithSymbol(currentValue, currency)
                : "—"}
            </p>
            {pl != null && plPercent != null && (
              <span
                className={cn(
                  "font-medium tabular-nums",
                  pl >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {formatPercent(plPercent)}
              </span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setEditing(true)}
              disabled={submitting}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={submitting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
