"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { UserRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      router.push(ROUTES.SIGN_IN);
      return;
    }

    const checkRole = async () => {
      try {
        const res = await fetch("/api/users/me");
        if (!res.ok) {
          throw new Error("Failed to fetch user role");
        }
        
        const data = await res.json();
        
        if (!data.user?.onboardingCompleted) {
          router.push(ROUTES.ONBOARDING);
          return;
        }

        const userRole = data.user?.role as UserRole;
        
        if (allowedRoles.includes(userRole)) {
          setIsAuthorized(true);
        } else {
          // Redirect based on actual role
          if (userRole === "patient") router.push(ROUTES.PATIENT_DASHBOARD);
          else if (userRole === "admin") router.push(ROUTES.ADMIN_DASHBOARD);
          else router.push(ROUTES.HOME);
        }
      } catch (error) {
        console.error("RoleGuard error:", error);
        router.push(ROUTES.SIGN_IN);
      }
    };

    checkRole();
  }, [isLoaded, user, router, allowedRoles]);

  if (!isLoaded || isAuthorized === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
