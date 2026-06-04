import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { formatDateShort } from "@/lib/utils";
import { Eye, Inbox, Star, TrendingUp, Building2 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | DentalBillingCompany.us",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  label,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  value: number | string;
  label: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#0F1F3D]">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
    </div>
  );
}

export default async function AnalyticsPage() {
  const session = await requireAuth();
  const userId = session.user?.id;

  const company = await prisma.company.findFirst({
    where: { ownerId: userId },
    select: {
      id: true,
      name: true,
      viewCount: true,
      leadCount: true,
      reviewCount: true,
      ratingAverage: true,
    },
  });

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-[#0F1F3D] mb-2">
          No Company Found
        </h2>
        <p className="text-slate-500 text-sm max-w-sm">
          You don&apos;t have a company listing yet. Claim an existing listing or
          register a new one to access analytics.
        </p>
      </div>
    );
  }

  const [recentLeads, recentReviews] = await Promise.all([
    prisma.lead.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        name: true,
        createdAt: true,
        serviceType: true,
        status: true,
      },
    }),
    prisma.review.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        rating: true,
        title: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl text-[#0F1F3D]">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">
          Performance overview for{" "}
          <span className="font-semibold text-[#0F1F3D]">{company.name}</span>
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Eye}
          iconColor="text-[#0F1F3D]"
          iconBg="bg-[#0F1F3D]/10"
          value={company.viewCount}
          label="Total Views"
        />
        <StatCard
          icon={Inbox}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
          value={company.leadCount}
          label="Total Leads"
        />
        <StatCard
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
          value={company.reviewCount}
          label="Total Reviews"
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          value={company.ratingAverage > 0 ? company.ratingAverage.toFixed(1) : "—"}
          label="Avg Rating"
        />
      </div>

      {/* Charts note */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl px-5 py-4 text-sm text-teal-700">
        Detailed analytics charts will appear as your listing accumulates traffic.
      </div>

      {/* Recent Activity Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F1F3D] text-base mb-4">
            Recent Leads
          </h2>
          {recentLeads.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              No leads yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 text-xs text-slate-400 font-medium pb-3">
                      Name
                    </th>
                    <th className="text-left py-2 text-xs text-slate-400 font-medium pb-3">
                      Service
                    </th>
                    <th className="text-left py-2 text-xs text-slate-400 font-medium pb-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td className="py-2.5 pr-3">
                        <p className="font-medium text-slate-800 truncate max-w-[130px]">
                          {lead.name}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="text-xs text-slate-500">
                          {lead.serviceType ?? "—"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="text-xs text-slate-400">
                          {formatDateShort(lead.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-[#0F1F3D] text-base mb-4">
            Recent Reviews
          </h2>
          {recentReviews.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              No reviews yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 text-xs text-slate-400 font-medium pb-3">
                      Rating
                    </th>
                    <th className="text-left py-2 text-xs text-slate-400 font-medium pb-3">
                      Title
                    </th>
                    <th className="text-left py-2 text-xs text-slate-400 font-medium pb-3">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentReviews.map((review) => (
                    <tr key={review.id}>
                      <td className="py-2.5 pr-3">
                        <span className="text-amber-400 text-xs">
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="text-sm text-slate-700 truncate block max-w-[160px]">
                          {review.title ?? "Untitled"}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span className="text-xs text-slate-400">
                          {formatDateShort(review.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
