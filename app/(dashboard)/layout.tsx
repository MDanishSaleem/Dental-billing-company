import { requireAuth } from "@/lib/auth-utils";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <DashboardShell session={session}>
      {children}
    </DashboardShell>
  );
}
