import { requireAdmin } from "@/lib/auth-utils";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AdminShell
      user={{
        name: session.user?.name ?? "Admin",
        email: session.user?.email ?? "",
        image: session.user?.image ?? undefined,
      }}
    >
      {children}
    </AdminShell>
  );
}
