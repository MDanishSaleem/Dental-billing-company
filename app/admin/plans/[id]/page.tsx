import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PlanEditForm } from "@/components/admin/plans/PlanEditForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminPlanEditPage({ params }: PageProps) {
  await requireAdmin();

  const plan = await prisma.plan.findUnique({
    where: { id: Number(params.id) },
    select: {
      id: true,
      name: true,
      tier: true,
      price: true,
      billingCycle: true,
      features: true,
      maxGalleryImages: true,
      maxServices: true,
      stripePriceId: true,
      isActive: true,
      isPopular: true,
      sortOrder: true,
    },
  });

  if (!plan) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-primary">Edit Plan</h1>
        <p className="text-slate-500 text-sm mt-0.5">{plan.name}</p>
      </div>
      <PlanEditForm plan={plan} />
    </div>
  );
}
