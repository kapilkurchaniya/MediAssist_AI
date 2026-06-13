import RoleGuard from "@/components/layout/RoleGuard";
import AppShell from "@/components/layout/AppShell";
import { ROLES } from "@/constants/roles";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.ADMIN]}>
      <AppShell role={ROLES.ADMIN}>
        {children}
      </AppShell>
    </RoleGuard>
  );
}
