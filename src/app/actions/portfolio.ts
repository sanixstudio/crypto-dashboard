"use server";

import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  parsePreferences,
  type UserPreferences,
  type Holding,
} from "@/lib/user-preferences";

const MAX_HOLDINGS = 50;

async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

async function getCurrentHoldings(userId: string): Promise<Holding[]> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prefs = parsePreferences(user.publicMetadata?.cryptoDashboard);
  return prefs.holdings ?? [];
}

async function updateHoldings(
  userId: string,
  holdings: Holding[]
): Promise<void> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prefs = parsePreferences(user.publicMetadata?.cryptoDashboard);
  const updated: UserPreferences = { ...prefs, holdings };
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      cryptoDashboard: updated,
    },
  });
}

/**
 * Get the current user's portfolio holdings (for server components).
 */
export async function getHoldings(): Promise<Holding[]> {
  const userId = await getUserId();
  if (!userId) return [];
  return getCurrentHoldings(userId);
}

/**
 * Add a holding to the user's portfolio.
 * @param coinId - CoinGecko coin ID (e.g. bitcoin)
 * @param amount - Quantity held
 * @param costBasis - Optional total amount paid (for P&L)
 */
export async function addHolding(
  coinId: string,
  amount: number,
  costBasis?: number
): Promise<
  | { success: true; holding: Holding }
  | { success: false; error: string }
> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Sign in required" };

  const trimmed = coinId.trim().toLowerCase();
  if (!trimmed) return { success: false, error: "Coin is required" };
  if (amount <= 0 || !Number.isFinite(amount)) {
    return { success: false, error: "Amount must be greater than 0" };
  }
  if (costBasis !== undefined && (costBasis < 0 || !Number.isFinite(costBasis))) {
    return { success: false, error: "Cost basis must be a positive number" };
  }

  const holdings = await getCurrentHoldings(userId);
  if (holdings.length >= MAX_HOLDINGS) {
    return { success: false, error: `Portfolio full (max ${MAX_HOLDINGS} holdings)` };
  }

  const holding: Holding = {
    id: crypto.randomUUID(),
    coinId: trimmed,
    amount,
    costBasis,
  };
  await updateHoldings(userId, [...holdings, holding]);
  revalidatePath("/");
  revalidatePath("/portfolio");
  return { success: true, holding };
}

/**
 * Update an existing holding.
 */
export async function updateHolding(
  holdingId: string,
  updates: { amount?: number; costBasis?: number }
): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Sign in required" };

  const holdings = await getCurrentHoldings(userId);
  const idx = holdings.findIndex((h) => h.id === holdingId);
  if (idx === -1) return { success: false, error: "Holding not found" };

  const current = holdings[idx];
  const amount = updates.amount ?? current.amount;
  const costBasis = updates.costBasis !== undefined ? updates.costBasis : current.costBasis;

  if (amount <= 0 || !Number.isFinite(amount)) {
    return { success: false, error: "Amount must be greater than 0" };
  }
  if (costBasis !== undefined && (costBasis < 0 || !Number.isFinite(costBasis))) {
    return { success: false, error: "Cost basis must be a positive number" };
  }

  const updated: Holding[] = [...holdings];
  updated[idx] = { ...current, amount, costBasis };
  await updateHoldings(userId, updated);
  revalidatePath("/");
  revalidatePath("/portfolio");
  return { success: true };
}

/**
 * Remove a holding from the portfolio.
 */
export async function removeHolding(holdingId: string): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Sign in required" };

  const holdings = await getCurrentHoldings(userId);
  const filtered = holdings.filter((h) => h.id !== holdingId);
  if (filtered.length === holdings.length) {
    return { success: false, error: "Holding not found" };
  }
  await updateHoldings(userId, filtered);
  revalidatePath("/");
  revalidatePath("/portfolio");
  return { success: true };
}
