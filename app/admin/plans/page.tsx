import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CreditCard, Edit2 } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { PlanActiveToggle } from "@/components/admin/plans/PlanActiveToggle";

export const dynamic = "force-dynamic";

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    FEATURED: "bg-amber-100 text-amber-700 border border-amber-200",
    PREMIUM: "bg-teal-100 text-teal-700",
    BASIC: "bg-slate-100 text-slate-600",
    FREE: "bg-slate-50 text-slate-400",
  };
  return (
    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", map[tier] ?? "bg-slate-50 text-slate-400")}>
      {tier}
    </span>
  );
}

export default async function AdminPlansPage() {
  await requireAdmin();

  const plans = await prisma.plan.findMany({
    orderBy: [{ sortOrder: "asc" }, { tier: "asc" }],
    select: {
      id: true,
      name: true,
      tier: true,
      price: true,
      billingCycle: true,
      isActive: true,
      isPopular: true,
      sortOrder: true,
      stripePriceId: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">Plans &amp; Pricing</h1>
          <p className="text-slate-500 text-sm mt-0.5">{plans.length} plans configured</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {plans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CreditCard className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No plans configured</p>
          </div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Tier</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Billing</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Stripe ID</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Active</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-800">{plan.name}</span>
                        {plan.isPopular && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-500 text-white">Popular</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3"><TierBadge tier={plan.tier} /></td>
                    <td className="px-4 py-3 text-slate-700 font-semibold">{formatCurrency(Number(plan.price))}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{plan.billingCycle}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs font-mono">{plan.stripePriceId ?? "—"}</td>
                    <td className="px-4 py-3">
                      <PlanActiveToggle planId={plan.id} isActive={plan.isActive} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <Link
                          href={`/admin/plans/${plan.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {plans.map((plan) => (
            <div key={plan.id} className="p-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-800 text-sm">{plan.name}</span>
                  <TierBadge tier={plan.tier} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(Number(plan.price))} / {plan.billingCycle}</p>
                <div className="mt-2">
                  <PlanActiveToggle planId={plan.id} isActive={plan.isActive} />
                </div>
              </div>
              <Link
                href={`/admin/plans/${plan.id}`}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                <Edit2 className="w-3 h-3" /> Edit
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
