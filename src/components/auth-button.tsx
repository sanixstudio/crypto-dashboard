"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

const hasValidClerkKey =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_") &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes("placeholder");

/**
 * Renders Clerk UserButton when configured, else Sign In link.
 */
export function AuthButton() {
  if (hasValidClerkKey) {
    return <UserButton afterSignOutUrl="/" signInUrl="/sign-in" />;
  }
  return (
    <Link href="/sign-in">
      <Button variant="outline" size="sm">
        Sign In
      </Button>
    </Link>
  );
}
