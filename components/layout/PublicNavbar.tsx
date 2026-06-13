"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { UserButton, useAuth } from "@clerk/nextjs";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PublicNavbar() {
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();

  const links = [
    { name: "Features", href: ROUTES.FEATURES },
    { name: "How it Works", href: ROUTES.HOW_IT_WORKS },
    { name: "Pricing", href: ROUTES.PRICING },
    { name: "About", href: ROUTES.ABOUT },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.HOME} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-bold">M</span>
          </div>
          <span className="text-xl font-bold text-foreground">MediAssist AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {isLoaded && !userId && (
            <>
              <Link href={ROUTES.SIGN_IN}>
                <Button variant="ghost" className="hidden sm:inline-flex">
                  Log in
                </Button>
              </Link>
              <Link href={ROUTES.SIGN_UP}>
                <Button>Get Started</Button>
              </Link>
            </>
          )}
          {isLoaded && userId && (
            <>
              <Link href={ROUTES.ONBOARDING}>
                <Button variant="outline" className="mr-4">Dashboard</Button>
              </Link>
              <UserButton />
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
