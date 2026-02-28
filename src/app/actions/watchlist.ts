"use server";

import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import {
  parsePreferences,
  type UserPreferences,
} from "@/lib/user-preferences";

async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

async function getCurrentWatchlist(userId: string): Promise<string[]> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prefs = parsePreferences(user.publicMetadata?.cryptoDashboard);
  return prefs.watchlist ?? [];
}

/**
 * Get the current user's watchlist (for server components).
 */
export async function getWatchlist(): Promise<string[]> {
  const userId = await getUserId();
  if (!userId) return [];
  return getCurrentWatchlist(userId);
}

async function updateWatchlist(
  userId: string,
  watchlist: string[]
): Promise<void> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const prefs = parsePreferences(user.publicMetadata?.cryptoDashboard);
  const updated: UserPreferences = { ...prefs, watchlist };
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      ...user.publicMetadata,
      cryptoDashboard: updated,
    },
  });
}

/**
 * Add a coin to the user's watchlist.
 */
export async function addToWatchlist(coinId: string): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Sign in required" };

  const watchlist = await getCurrentWatchlist(userId);
  if (watchlist.includes(coinId)) return { success: true };
  if (watchlist.length >= 50) return { success: false, error: "Watchlist full (max 50)" };

  await updateWatchlist(userId, [...watchlist, coinId]);
  revalidatePath("/");
  revalidatePath("/watchlist");
  revalidatePath("/coins");
  revalidatePath("/trending");
  return { success: true };
}

/**
 * Remove a coin from the user's watchlist.
 */
export async function removeFromWatchlist(coinId: string): Promise<
  | { success: true }
  | { success: false; error: string }
> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Sign in required" };

  const watchlist = await getCurrentWatchlist(userId).then((w) =>
    w.filter((id) => id !== coinId)
  );
  await updateWatchlist(userId, watchlist);
  revalidatePath("/");
  revalidatePath("/watchlist");
  revalidatePath("/coins");
  revalidatePath("/trending");
  return { success: true };
}

/**
 * Toggle a coin in the watchlist.
 */
export async function toggleWatchlist(coinId: string): Promise<
  | { success: true; inWatchlist: boolean }
  | { success: false; error: string }
> {
  const userId = await getUserId();
  if (!userId) return { success: false, error: "Sign in required" };

  const watchlist = await getCurrentWatchlist(userId);
  const inList = watchlist.includes(coinId);
  const next = inList ? watchlist.filter((id) => id !== coinId) : [...watchlist, coinId];

  if (!inList && next.length > 50) return { success: false, error: "Watchlist full (max 50)" };

  await updateWatchlist(userId, next);
  revalidatePath("/");
  revalidatePath("/watchlist");
  revalidatePath("/coins");
  revalidatePath("/trending");
  return { success: true, inWatchlist: !inList };
}
