import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import {
  Building2,
  Star,
  Inbox,
  Users,
  Sparkles,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
} from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ─── Stat Card ────────────────────────────────────────────────────────────────

type Trend = "up" | "down" | "neutral";

function StatCard({
  icon: Icon,
  iconColor,
  iconBg,
  value,
  label,
  sub,
  trend,
  trendLabel,
  href,
}: {
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  value: number | string;
  label: string;
  sub?: string;
  trend?: Trend;
  trendLabel?: string;
  href?: string;
}) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
      ? "text-red-500"
      : "text-slate-400";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend && trendLabel && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            {trendLabel}
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-primary">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
        <p className="text-sm text-slate-500 font-medium mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="text-xs text-teal-600 hover:underline font-semibold"
        >
          View all →
        </Link>
      )}
    </div>
  );
}

// ─── Recent Activity Row ──────────────────────────────────────────────────────

function RecentCompanyRow({
  company,
}: {
  company: {
    id: string;
    slug: string;
    name: string;
    status: string;
    tier: string;
    createdAt: Date;
    city: { name: string } | null;
    state: { abbreviation: string } | null;
  };
}) {
  const statusColors: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-gold-100 text-gold-700",
    SUSPENDED: "bg-red-100 text-red-700",
    REJECTED: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Building2 className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/admin/companies/${company.id}/edit`}
          className="text-sm font-semibold text-slate-800 hover:text-teal-600 transition-colors truncate block"
        >
          {company.name}
        </Link>
        <p className="text-xs text-slate-400">
          {company.city && company.state
            ? `${company.city.name}, ${company.state.abbreviation}`
            : "—"}{" "}
          · {formatDateShort(company.createdAt)}
        </p>
      </div>
      <span
        className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[company.status] ?? "bg-slate-100 text-slate-600"}`}
      >
        {company.status}
      </span>
    </div>
  );
}

function RecentReviewRow({
  review,
}: {
  review: {
    id: string;
    rating: number;
    status: string;
    reviewerName: string | null;
    createdAt: Date;
    company: { name: string; slug: string };
  };
}) {
  const statusColors: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-gold-100 text-gold-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className="w-8 h-8 rounded-lg bg-gold-50 flex items-center justify-center shrink-0">
        <Star className="w-4 h-4 text-gold-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">
          {review.reviewerName ?? "Anonymous"}{" "}
          <span className="font-normal text-slate-400">→</span>{" "}
          {review.company.name}
        </p>
        <p className="text-xs text-slate-400">
          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} ·{" "}
          {formatDateShort(review.createdAt)}
        </p>
      </div>
      <span
        className={`shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusColors[review.status] ?? "bg-slate-100 text-slate-600"}`}
      >
        {review.status}
      </span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  await requireAdmin();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalCompanies,
    activeCompanies,
    pendingCompanies,
    totalReviews,
    approvedReviews,
    pendingReviews,
    leadsThisMonth,
    totalUsers,
    featuredCount,
    revenueAgg,
    recentCompanies,
    recentReviews,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.company.count({ where: { status: "ACTIVE" } }),
    prisma.company.count({ where: { status: "PENDING" } }),
    prisma.review.count(),
    prisma.review.count({ where: { status: "APPROVED" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.lead.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.user.count(),
    prisma.company.count({ where: { isFeatured: true } }),
    prisma.paymentTransaction.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),
    prisma.company.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        status: true,
        tier: true,
        createdAt: true,
        city: { select: { name: true } },
        state: { select: { abbreviation: true } },
      },
    }),
    prisma.review.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        status: true,
        reviewerName: true,
        createdAt: true,
        company: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.amount ?? 0);

  const stats = [
    {
      icon: Building2,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
      value: totalCompanies,
      label: "Total Companies",
      sub: `${activeCompanies} active · ${pendingCompanies} pending`,
      trend: "up" as Trend,
      trendLabel: `${activeCompanies} active`,
      href: "/admin/companies",
    },
    {
      icon: Star,
      iconColor: "text-gold-600",
      iconBg: "bg-gold-50",
      value: totalReviews,
      label: "Total Reviews",
      sub: `${approvedReviews} approved · ${pendingReviews} pending`,
      trend: (pendingReviews > 0 ? "up" : "neutral") as Trend,
      trendLabel: pendingReviews > 0 ? `${pendingReviews} need review` : "All reviewed",
      href: "/admin/reviews",
    },
    {
      icon: Inbox,
      iconColor: "text-teal-600",
      iconBg: "bg-teal-50",
      value: leadsThisMonth,
      label: "Leads This Month",
      sub: "New inquiries received",
      trend: "up" as Trend,
      trendLabel: "This month",
      href: "/admin/leads",
    },
    {
      icon: Users,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-50",
      value: totalUsers,
      label: "Registered Users",
      sub: "All-time registrations",
      trend: "neutral" as Trend,
      href: "/admin/users",
    },
    {
      icon: Sparkles,
      iconColor: "text-gold-600",
      iconBg: "bg-gold-50",
      value: featuredCount,
      label: "Featured Listings",
      sub: "Currently featured",
      trend: "neutral" as Trend,
      href: "/admin/companies?tier=FEATURED",
    },
    {
      icon: DollarSign,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-50",
      value: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      label: "Total Revenue",
      sub: "Completed transactions",
      trend: "up" as Trend,
      trendLabel: "All time",
      href: "/admin/payments",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-2xl text-primary">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back. Here's what's happening with your directory.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Companies */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="font-display font-semibold text-primary text-base">
                Recently Added Companies
              </h2>
            </div>
            <Link
              href="/admin/companies"
              className="text-xs text-teal-600 hover:underline font-semibold"
            >
              View all
            </Link>
          </div>
          {recentCompanies.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">
              No companies yet
            </p>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentCompanies.map((company) => (
                <RecentCompanyRow key={company.id} company={company} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <h2 className="font-display font-semibold text-primary text-base">
                Recent Reviews
              </h2>
            </div>
            <Link
              href="/admin/reviews"
              className="text-xs text-teal-600 hover:underline font-semibold"
            >
              View all
            </Link>
          </div>
          {recentReviews.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-6">
              No reviews yet
            </p>
          ) : (
            <div className="divide-y divide-slate-50">
              {recentReviews.map((review) => (
                <RecentReviewRow key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
