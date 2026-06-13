"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ROUTES } from "@/constants/routes";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [error, setError] = useState<string | null>(null);
  const isProcessing = useRef(false);

  useEffect(() => {
    if (!isLoaded || !user || isProcessing.current) return;

    const setupAccount = async () => {
      isProcessing.current = true;
      try {
        // 1. Check if already onboarded
        const statusRes = await fetch("/api/users/me");
        if (statusRes.ok) {
          const data = await statusRes.json();
          if (data.user?.onboardingCompleted) {
            router.push(ROUTES.PATIENT_DASHBOARD);
            return;
          }
        }

        // 2. Sync user to DB
        const syncRes = await fetch("/api/users/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress,
            fullName: user.fullName || "New User",
            avatarUrl: user.imageUrl,
          }),
        });

        if (!syncRes.ok) throw new Error("Failed to sync user");

        // 3. Complete onboarding as patient
        const onboardRes = await fetch("/api/users/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: "patient" }),
        });

        if (onboardRes.ok) {
          router.push(ROUTES.PATIENT_DASHBOARD);
        } else {
          throw new Error("Failed to complete onboarding");
        }
      } catch (err) {
        console.error("Onboarding Error:", err);
        setError("Failed to set up your account. Please refresh to try again.");
      }
    };

    setupAccount();
  }, [isLoaded, user, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <h1 className="text-xl font-semibold text-foreground">Setting up your account...</h1>
        <p className="text-sm text-muted-foreground">Please wait a moment while we prepare your dashboard.</p>
      </div>
    </div>
  );
}
