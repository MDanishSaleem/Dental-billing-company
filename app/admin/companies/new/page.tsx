import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CompanyForm } from "@/components/admin/companies/CompanyForm";

export const dynamic = "force-dynamic";

export default async function NewCompanyPage() {
  await requireAdmin();

  const [states, serviceCategories] = await Promise.all([
    prisma.state.findMany({
      select: { id: true, name: true, abbreviation: true },
      orderBy: { name: "asc" },
    }),
    prisma.serviceCategory.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

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
          Add New Company
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Fill in the details below to create a new company listing.
        </p>
      </div>

      <CompanyForm
        mode="new"
        states={states}
        serviceCategories={serviceCategories}
      />
    </div>
  );
}
