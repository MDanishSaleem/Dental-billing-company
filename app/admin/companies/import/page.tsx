import { requireAdmin } from "@/lib/auth-utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CSVImporter } from "@/components/admin/companies/CSVImporter";

export const dynamic = "force-dynamic";

export default async function ImportCompaniesPage() {
  await requireAdmin();

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Companies
        </Link>
        <h1 className="font-display font-bold text-2xl text-primary">
          Import Companies
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload a CSV file to bulk-import company listings.
        </p>
      </div>

      <CSVImporter />
    </div>
  );
}
