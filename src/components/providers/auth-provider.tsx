"use client";

import { ClerkProvider } from "@clerk/nextjs";

const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const hasValidClerkKey =
  publishableKey && publishableKey.startsWith("pk_") && !publishableKey.includes("placeholder");

/**
 * Conditionally wraps app with ClerkProvider when valid keys are present.
 * Allows build/run without Clerk keys (auth UI hidden).
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (hasValidClerkKey) {
    return <ClerkProvider>{children}</ClerkProvider>;
  }
  return <>{children}</>;
}
