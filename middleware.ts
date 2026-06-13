import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/features",
  "/how-it-works",
  "/pricing",
  "/about",
  "/contact",
  "/privacy-policy",
  "/terms",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks/clerk(.*)",
]);

const isAuthRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);
const isPatientRoute = createRouteMatcher(["/patient(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If user is not signed in and trying to access a protected route
  if (!userId && !isPublicRoute(req)) {
    return (await auth()).redirectToSignIn();
  }

  // We cannot easily check DB role in edge middleware (Mongoose doesn't work on edge).
  // Real role-based protection will happen in layout.tsx or page.tsx using `getCurrentUser()`.
  // Here we just ensure authentication.

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
