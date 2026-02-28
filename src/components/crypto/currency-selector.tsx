"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { setCurrency } from "@/app/actions/currency";
import type { Currency } from "@/lib/user-preferences";

const CURRENCY_LABELS: Record<Currency, string> = {
  usd: "USD",
  eur: "EUR",
  gbp: "GBP",
};

interface CurrencySelectorProps {
  value: Currency;
}

/**
 * Currency selector for display preferences.
 * Persists selection to cookie and refreshes server data.
 */
export function CurrencySelector({ value }: CurrencySelectorProps) {
  const router = useRouter();

  const handleChange = async (newValue: Currency) => {
    await setCurrency(newValue);
    router.refresh();
  };

  return (
    <Select value={value} onValueChange={handleChange}>
      <SelectTrigger size="sm" className="w-[88px]">
        <SelectValue placeholder="Currency" />
      </SelectTrigger>
      <SelectContent>
        {(["usd", "eur", "gbp"] as const).map((c) => (
          <SelectItem key={c} value={c}>
            {CURRENCY_LABELS[c]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
