import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { formatDateShort, truncate } from "@/lib/utils";
import Link from "next/link";
import { Eye, Inbox, Star, TrendingUp, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | DentalBillingCompany.us",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  label,
  sub,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  value: number | string;
  label: string;
  sub?: string;
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
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default async function DashboardHomePage() {
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
      tier: true,
      status: true,
    },
  });

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-[#0F1F3D] mb-2">
          No company found
        </h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">
          You haven&apos;t claimed a company yet. Register your company or browse
          the directory to claim an existing listing.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#0F1F3D]/90 transition-colors"
          >
            Register a Company
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center justify-center h-10 px-5 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:border-teal-500 hover:text-teal-600 transition-colors"
          >
            Browse Directory
          </Link>
        </div>
      </div>
    );
  }

  const [recentLeads, recentReviews] = await Promise.all([
    prisma.lead.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        serviceType: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.review.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        rating: true,
        title: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const leadStatusVariant: Record<
    string,
    "default" | "teal" | "emerald_light" | "muted"
  > = {
    NEW: "teal",
    CONTACTED: "default",
    CONVERTED: "emerald_light",
    ARCHIVED: "muted",
  };

  const reviewStatusVariant: Record<
    string,
    "emerald_light" | "gold" | "muted"
  > = {
    APPROVED: "emerald_light",
    PENDING: "gold",
    REJECTED: "muted",
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl text-[#0F1F3D]">
          Welcome back
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Here&apos;s an overview of your listing:{" "}
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
          label="Profile Views"
          sub="All-time"
        />
        <StatCard
          icon={Inbox}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
          value={company.leadCount}
          label="Total Leads"
          sub="Inquiries received"
        />
        <StatCard
          icon={Star}
          iconColor="text-amber-500"
          iconBg="bg-amber-50"
          value={company.reviewCount}
          label="Reviews"
          sub="All-time"
        />
        <StatCard
          icon={TrendingUp}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          value={
            company.ratingAverage > 0
              ? `${company.ratingAverage.toFixed(1)} / 5`
              : "—"
          }
          label="Avg. Rating"
          sub={company.reviewCount > 0 ? `From ${company.reviewCount} reviews` : "No reviews yet"}
        />
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0F1F3D] text-base">
              Recent Leads
            </h2>
            <Link
              href="/dashboard/leads"
              className="text-xs text-teal-600 hover:underline font-semibold"
            >
              View all
            </Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              No leads yet. Upgrade your listing to attract more inquiries.
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
                        <p className="font-medium text-slate-800 truncate max-w-[120px]">
                          {lead.name}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[120px]">
                          {lead.email}
                        </p>
                      </td>
                      <td className="py-2.5 pr-3">
                        <span className="text-xs text-slate-600">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#0F1F3D] text-base">
              Recent Reviews
            </h2>
            <Link
              href="/dashboard/reviews"
              className="text-xs text-teal-600 hover:underline font-semibold"
            >
              View all
            </Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">
              No reviews yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentReviews.map((review) => (
                <div
                  key={review.id}
                  className="flex items-start justify-between gap-3 py-2.5 border-b border-slate-50 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-amber-400 text-xs leading-none">
                        {"★".repeat(review.rating)}
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {review.title ?? "Untitled Review"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateShort(review.createdAt)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      (reviewStatusVariant[review.status] as
                        | "emerald_light"
                        | "gold"
                        | "muted") ?? "muted"
                    }
                    className="shrink-0 text-[11px]"
                  >
                    {review.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
