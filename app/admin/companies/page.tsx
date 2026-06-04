import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Building2,
  Search,
  Plus,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, generateInitials, getInitialColor, formatDateShort } from "@/lib/utils";
import { CompanyStatus, ListingTier } from "@prisma/client";
import { FeatureToggle } from "@/components/admin/FeatureToggle";
import { ApproveButton } from "@/components/admin/ApproveButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    SUSPENDED: "bg-red-100 text-red-700",
    REJECTED: "bg-slate-100 text-slate-500",
  };
  return (
    <span
      className={cn(
        "text-[11px] font-semibold px-2 py-0.5 rounded-full",
        map[status] ?? "bg-slate-100 text-slate-500"
      )}
    >
      {status}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  const map: Record<string, string> = {
    FEATURED: "bg-amber-100 text-amber-700 border border-amber-200",
    PREMIUM: "bg-teal-100 text-teal-700",
    BASIC: "bg-slate-100 text-slate-600",
    FREE: "bg-slate-50 text-slate-400",
  };
  return (
    <span
      className={cn(
        "text-[11px] font-semibold px-2 py-0.5 rounded-full",
        map[tier] ?? "bg-slate-50 text-slate-400"
      )}
    >
      {tier}
    </span>
  );
}

// ─── Filter Form ─────────────────────────────────────────────────────────────

function FilterRow({
  status,
  tier,
  search,
}: {
  status: string;
  tier: string;
  search: string;
}) {
  return (
    <form
      method="GET"
      className="flex flex-wrap gap-3 items-center"
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          name="search"
          defaultValue={search}
          placeholder="Search by name, city…"
          className="w-full pl-9 pr-4 h-9 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>

      {/* Status filter */}
      <select
        name="status"
        defaultValue={status}
        className="h-9 rounded-lg border border-slate-200 bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="">All Statuses</option>
        {Object.values(CompanyStatus).map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* Tier filter */}
      <select
        name="tier"
        defaultValue={tier}
        className="h-9 rounded-lg border border-slate-200 bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="">All Tiers</option>
        {Object.values(ListingTier).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
      >
        Filter
      </button>

      {(status || tier || search) && (
        <Link
          href="/admin/companies"
          className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:text-slate-700 flex items-center transition-colors"
        >
          Clear
        </Link>
      )}
    </form>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  searchParams,
}: {
  page: number;
  totalPages: number;
  searchParams: Record<string, string>;
}) {
  function buildHref(p: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(p) });
    return `/admin/companies?${params.toString()}`;
  }

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-slate-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Link
          href={buildHref(page - 1)}
          aria-disabled={page <= 1}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors",
            page <= 1
              ? "opacity-40 pointer-events-none border-slate-100 text-slate-400"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Prev
        </Link>
        <Link
          href={buildHref(page + 1)}
          aria-disabled={page >= totalPages}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors",
            page >= totalPages
              ? "opacity-40 pointer-events-none border-slate-100 text-slate-400"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          )}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SearchParams = {
  search?: string;
  status?: string;
  tier?: string;
  page?: string;
};

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requireAdmin();

  const search = searchParams.search ?? "";
  const statusFilter = searchParams.status ?? "";
  const tierFilter = searchParams.tier ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { city: { name: { contains: search } } },
            { state: { name: { contains: search } } },
          ],
        }
      : {}),
    ...(statusFilter ? { status: statusFilter as CompanyStatus } : {}),
    ...(tierFilter ? { tier: tierFilter as ListingTier } : {}),
  };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        logo: true,
        status: true,
        tier: true,
        isFeatured: true,
        ratingAverage: true,
        reviewCount: true,
        createdAt: true,
        city: { select: { name: true } },
        state: { select: { abbreviation: true } },
      },
    }),
    prisma.company.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const spRecord: Record<string, string> = {};
  if (search) spRecord.search = search;
  if (statusFilter) spRecord.status = statusFilter;
  if (tierFilter) spRecord.tier = tierFilter;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">
            Companies
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {total.toLocaleString()} total{" "}
            {search || statusFilter || tierFilter ? "results" : "companies"}
          </p>
        </div>
        <Link
          href="/admin/companies/new"
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Company
        </Link>
      </div>

      {/* Filters */}
      <FilterRow status={statusFilter} tier={tierFilter} search={search} />

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Building2 className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No companies found</p>
            <p className="text-slate-400 text-sm mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Company
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Location
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Tier
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Rating
                    </th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Added
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((company) => {
                    const initials = generateInitials(company.name);
                    const bgColor = getInitialColor(company.name);
                    return (
                      <tr
                        key={company.id}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Name + Logo */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {company.logo ? (
                              <div className="w-9 h-9 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                                <Image
                                  src={company.logo}
                                  alt={company.name}
                                  width={36}
                                  height={36}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0",
                                  bgColor
                                )}
                              >
                                {initials}
                              </div>
                            )}
                            <div className="min-w-0">
                              <Link
                                href={`/admin/companies/${company.id}/edit`}
                                className="font-semibold text-slate-800 hover:text-teal-600 transition-colors truncate block max-w-[180px]"
                              >
                                {company.name}
                              </Link>
                            </div>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {company.city && company.state
                            ? `${company.city.name}, ${company.state.abbreviation}`
                            : "—"}
                        </td>

                        {/* Tier */}
                        <td className="px-4 py-3">
                          <TierBadge tier={company.tier} />
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={company.status} />
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {company.ratingAverage > 0 ? (
                            <span>
                              ★ {company.ratingAverage.toFixed(1)}{" "}
                              <span className="text-slate-400">
                                ({company.reviewCount})
                              </span>
                            </span>
                          ) : (
                            <span className="text-slate-300">No reviews</span>
                          )}
                        </td>

                        {/* Created */}
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {formatDateShort(company.createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {company.status === "PENDING" && (
                              <ApproveButton companyId={company.id} />
                            )}
                            <FeatureToggle
                              companyId={company.id}
                              isFeatured={company.isFeatured}
                            />
                            <Link
                              href={`/admin/companies/${company.id}/edit`}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              Edit
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {companies.map((company) => {
                const initials = generateInitials(company.name);
                const bgColor = getInitialColor(company.name);
                return (
                  <div key={company.id} className="p-4 flex items-start gap-3">
                    {company.logo ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 shrink-0">
                        <Image
                          src={company.logo}
                          alt={company.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0",
                          bgColor
                        )}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/admin/companies/${company.id}/edit`}
                          className="font-semibold text-slate-800 hover:text-teal-600 text-sm truncate"
                        >
                          {company.name}
                        </Link>
                        <StatusBadge status={company.status} />
                        <TierBadge tier={company.tier} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {company.city && company.state
                          ? `${company.city.name}, ${company.state.abbreviation}`
                          : "—"}{" "}
                        · {formatDateShort(company.createdAt)}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {company.status === "PENDING" && (
                          <ApproveButton companyId={company.id} />
                        )}
                        <FeatureToggle
                          companyId={company.id}
                          isFeatured={company.isFeatured}
                        />
                        <Link
                          href={`/admin/companies/${company.id}/edit`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 pb-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              searchParams={spRecord}
            />
          </div>
        )}
      </div>
    </div>
  );
}
