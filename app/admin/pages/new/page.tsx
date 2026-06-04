import { requireAdmin } from "@/lib/auth-utils";
import { PageForm } from "@/components/admin/pages/PageForm";

export const dynamic = "force-dynamic";

export default async function NewPagePage() {
  await requireAdmin();

  return (
    <div className="p-6">
      <h1 className="font-display font-bold text-2xl text-primary mb-6">New Page</h1>
      <PageForm mode="new" />
    </div>
  );
}
