"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/constants/roles";
import { ROUTES } from "@/constants/routes";
import {
  LayoutDashboard,
  Users,
  FileText,
  Upload,
  Calendar,
  Pill,
  Settings,
  BarChart3,
  Activity,
  Menu,
  X,
  Ambulance,
  PhoneCall,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: UserRole;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ role, isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();


  const patientLinks = [
    { name: "Dashboard", href: ROUTES.PATIENT_DASHBOARD, icon: LayoutDashboard },
    { name: "Upload Prescription", href: ROUTES.PATIENT_UPLOAD, icon: Upload },
    { name: "My Prescriptions", href: ROUTES.PATIENT_PRESCRIPTIONS, icon: FileText },
    { name: "My Medicines", href: ROUTES.PATIENT_MEDICINES, icon: Pill },
    { name: "Schedule", href: ROUTES.PATIENT_SCHEDULE, icon: Calendar },
    { name: "Blood Reports", href: ROUTES.PATIENT_BLOOD_REPORTS, icon: Activity },
    { name: "Ambulance (102)", href: "tel:102", icon: Ambulance, className: "text-danger hover:text-danger hover:bg-danger/10" },
    { name: "Emergency (112)", href: "tel:112", icon: PhoneCall, className: "text-danger hover:text-danger hover:bg-danger/10" },
    { name: "Settings", href: ROUTES.PATIENT_SETTINGS, icon: Settings },
  ];

  const adminLinks = [
    { name: "Dashboard", href: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { name: "Users", href: ROUTES.ADMIN_USERS, icon: Users },
    { name: "API Logs", href: ROUTES.ADMIN_API_LOGS, icon: BarChart3 },
  ];

  const links =
    role === "patient"
      ? patientLinks
      : adminLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <Link href={ROUTES.HOME} className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-bold text-sm">M</span>
            </div>
            <span className="text-lg font-bold text-foreground">MediAssist AI</span>
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-sidebar-text hover:bg-sidebar-hover hover:text-foreground",
                  (link as any).className
                )}
                onClick={() => setIsOpen(false)}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : (link as any).className ? "text-danger" : "text-muted-foreground")} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border p-4">
          <div className="rounded-lg bg-primary/5 p-3">
            <p className="text-xs font-medium text-primary">MediAssist AI</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Powered by Gemini AI
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
