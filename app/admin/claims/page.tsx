import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDateShort, truncate } from "@/lib/utils";
import { ClaimStatus } from "@prisma/client";
import { ClaimActions } from "@/components/admin/claims/ClaimActions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APPROVED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    REJECTED: "bg-red-100 text-red-700",
  };
  return (
    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", map[status] ?? "bg-slate-100 text-slate-500")}>
      {status}
    </span>
  );
}

function FilterRow({ status }: { status: string }) {
  return (
    <form method="GET" className="flex flex-wrap gap-3 items-center">
      <select
        name="status"
        defaultValue={status}
        className="h-9 rounded-lg border border-slate-200 bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="">All Statuses</option>
        {Object.values(ClaimStatus).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button type="submit" className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
        Filter
      </button>
      {status && (
        <Link href="/admin/claims" className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:text-slate-700 flex items-center transition-colors">
          Clear
        </Link>
      )}
    </form>
  );
}

function Pagination({ page, totalPages, searchParams }: { page: number; totalPages: number; searchParams: Record<string, string> }) {
  function buildHref(p: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(p) });
    return `/admin/claims?${params.toString()}`;
  }
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Link href={buildHref(page - 1)} aria-disabled={page <= 1} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors", page <= 1 ? "opacity-40 pointer-events-none border-slate-100 text-slate-400" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
          <ChevronLeft className="w-4 h-4" /> Prev
        </Link>
        <Link href={buildHref(page + 1)} aria-disabled={page >= totalPages} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors", page >= totalPages ? "opacity-40 pointer-events-none border-slate-100 text-slate-400" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
          Next <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SearchParams = { status?: string; page?: string };

export default async function AdminClaimsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const statusFilter = searchParams.status ?? "PENDING";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = statusFilter ? { status: statusFilter as ClaimStatus } : {};

  const [claims, total] = await Promise.all([
    prisma.companyOwnerClaim.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        evidence: true,
        adminNotes: true,
        createdAt: true,
        company: { select: { id: true, name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.companyOwnerClaim.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const spRecord: Record<string, string> = {};
  if (statusFilter) spRecord.status = statusFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">Owner Claims</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString()} {statusFilter.toLowerCase()} claims</p>
        </div>
      </div>

      <FilterRow status={statusFilter} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {claims.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ShieldCheck className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No claims found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {claims.map((claim) => (
              <div key={claim.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">{claim.company.name}</span>
                      <StatusBadge status={claim.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Claimed by <span className="font-medium">{claim.user.name ?? "Unknown"}</span>{" "}
                      ({claim.user.email}) · {formatDateShort(claim.createdAt)}
                    </p>
                    {claim.evidence && (
                      <div className="mt-2 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 mb-1">Evidence</p>
                        <p className="text-xs text-slate-600">{truncate(claim.evidence, 200)}</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 shrink-0">{formatDateShort(claim.createdAt)}</p>
                </div>
                {claim.status === "PENDING" && (
                  <div className="mt-4">
                    <ClaimActions claimId={claim.id} />
                  </div>
                )}
                {claim.adminNotes && (
                  <p className="mt-2 text-xs text-slate-400 italic">Admin note: {claim.adminNotes}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 pb-4">
            <Pagination page={page} totalPages={totalPages} searchParams={spRecord} />
          </div>
        )}
      </div>
    </div>
  );
}
