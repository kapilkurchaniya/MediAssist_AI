import RoleGuard from "@/components/layout/RoleGuard";
import AppShell from "@/components/layout/AppShell";
import { ROLES } from "@/constants/roles";
import { AIAssistant } from "@/components/ui/ai-assistant";

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allowedRoles={[ROLES.PATIENT]}>
      <AppShell role={ROLES.PATIENT}>
        {children}
        <AIAssistant />
      </AppShell>
    </RoleGuard>
  );
}
