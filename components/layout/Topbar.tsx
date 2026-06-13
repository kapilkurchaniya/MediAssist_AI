"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu, Bell } from "lucide-react";
import { UserRole } from "@/constants/roles";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

interface TopbarProps {
  role: UserRole;
  toggleSidebar: () => void;
}

export default function Topbar({ role, toggleSidebar }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-foreground md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="hidden md:block">
          <h2 className="text-sm font-medium text-muted-foreground capitalize">
            {role} Dashboard
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute top-1.5 right-2 h-2 w-2 rounded-full bg-danger"></span>
        </Button>
        <UserButton 
          appearance={{
            elements: {
              avatarBox: "h-9 w-9"
            }
          }}
        />
      </div>
    </header>
  );
}
