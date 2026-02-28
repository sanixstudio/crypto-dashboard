import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { NextFetchEvent } from "next/server";

const hasValidClerkKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_") &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes("placeholder");

/**
 * Middleware - uses Clerk when configured, else passthrough.
 * Protects /settings when Clerk is active.
 */
export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (hasValidClerkKey) {
    const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
    const isProtectedRoute = createRouteMatcher(["/settings(.*)"]);
    const clerkMw = clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    });
    return clerkMw(request, event);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
