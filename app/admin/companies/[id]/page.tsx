import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CompanyForm } from "@/components/admin/companies/CompanyForm";

export const dynamic = "force-dynamic";

type Props = {
  params: { id: string };
};

export default async function EditCompanyPage({ params }: Props) {
  await requireAdmin();

  const [company, states, serviceCategories] = await Promise.all([
    prisma.company.findUnique({
      where: { id: params.id },
      include: {
        city: { select: { name: true } },
        state: { select: { id: true, name: true, abbreviation: true } },
        services: {
          include: { category: { select: { id: true, name: true } } },
        },
        owner: { select: { name: true, email: true } },
      },
    }),
    prisma.state.findMany({
      select: { id: true, name: true, abbreviation: true },
      orderBy: { name: "asc" },
    }),
    prisma.serviceCategory.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (!company) {
    notFound();
  }

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
          Edit Company
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Editing:{" "}
          <span className="font-semibold text-slate-700">{company.name}</span>
        </p>
      </div>

      <CompanyForm
        mode="edit"
        company={{
          id: company.id,
          name: company.name,
          slug: company.slug,
          tagline: company.tagline,
          description: company.description,
          status: company.status,
          tier: company.tier,
          isFeatured: company.isFeatured,
          isVerified: company.isVerified,
          isClaimed: company.isClaimed,
          email: company.email,
          phone: company.phone,
          website: company.website,
          contactName: company.contactName,
          address: company.address,
          cityId: company.cityId,
          stateId: company.stateId,
          zipCode: company.zipCode,
          logo: company.logo,
          coverImage: company.coverImage,
          yearFounded: company.yearFounded,
          employeeCount: company.employeeCount,
          metaTitle: company.metaTitle,
          metaDescription: company.metaDescription,
          linkedIn: company.linkedIn,
          twitter: company.twitter,
          facebook: company.facebook,
          serviceArea: company.serviceArea,
          services: company.services,
        }}
        states={states}
        serviceCategories={serviceCategories}
      />
    </div>
  );
}
