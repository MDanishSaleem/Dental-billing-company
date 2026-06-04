import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatDateShort, truncate } from "@/lib/utils";
import { ReviewStatus } from "@prisma/client";
import { ReviewActions } from "@/components/admin/reviews/ReviewActions";

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

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400 text-sm">
      {"★".repeat(Math.max(0, Math.min(5, rating)))}
      {"☆".repeat(Math.max(0, 5 - Math.min(5, rating)))}
    </span>
  );
}

function FilterRow({ status, company }: { status: string; company: string }) {
  return (
    <form method="GET" className="flex flex-wrap gap-3 items-center">
      <select
        name="status"
        defaultValue={status}
        className="h-9 rounded-lg border border-slate-200 bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="">All Statuses</option>
        {Object.values(ReviewStatus).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <input
        name="company"
        defaultValue={company}
        placeholder="Filter by company…"
        className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[180px]"
      />
      <button type="submit" className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
        Filter
      </button>
      {(status || company) && (
        <Link href="/admin/reviews" className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:text-slate-700 flex items-center transition-colors">
          Clear
        </Link>
      )}
    </form>
  );
}

function Pagination({ page, totalPages, searchParams }: { page: number; totalPages: number; searchParams: Record<string, string> }) {
  function buildHref(p: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(p) });
    return `/admin/reviews?${params.toString()}`;
  }
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Link
          href={buildHref(page - 1)}
          aria-disabled={page <= 1}
          className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors", page <= 1 ? "opacity-40 pointer-events-none border-slate-100 text-slate-400" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Link>
        <Link
          href={buildHref(page + 1)}
          aria-disabled={page >= totalPages}
          className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors", page >= totalPages ? "opacity-40 pointer-events-none border-slate-100 text-slate-400" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
        >
          Next <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SearchParams = { status?: string; company?: string; page?: string };

export default async function AdminReviewsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const statusFilter = searchParams.status ?? "PENDING";
  const companyFilter = searchParams.company ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(statusFilter ? { status: statusFilter as ReviewStatus } : {}),
    ...(companyFilter ? { company: { name: { contains: companyFilter } } } : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        status: true,
        reviewerName: true,
        reviewerEmail: true,
        createdAt: true,
        company: { select: { id: true, name: true, slug: true } },
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const spRecord: Record<string, string> = {};
  if (statusFilter) spRecord.status = statusFilter;
  if (companyFilter) spRecord.company = companyFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">Reviews</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString()} {statusFilter ? statusFilter.toLowerCase() : "total"} reviews</p>
        </div>
      </div>

      <FilterRow status={statusFilter} company={companyFilter} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Star className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No reviews found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Company</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Reviewer</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Rating</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Review</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Date</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => {
                    const reviewer = review.user?.name ?? review.reviewerName ?? "Anonymous";
                    return (
                      <tr key={review.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <Link href={`/admin/companies`} className="font-medium text-slate-800 hover:text-teal-600 transition-colors text-xs">
                            {review.company.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{reviewer}</td>
                        <td className="px-4 py-3"><StarRating rating={review.rating} /></td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-slate-700">{review.title ?? ""}</p>
                          <p className="text-xs text-slate-400">{truncate(review.content, 80)}</p>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={review.status} /></td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{formatDateShort(review.createdAt)}</td>
                        <td className="px-4 py-3">
                          <ReviewActions reviewId={review.id} status={review.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {reviews.map((review) => {
                const reviewer = review.user?.name ?? review.reviewerName ?? "Anonymous";
                return (
                  <div key={review.id} className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-medium text-slate-800 text-sm">{review.company.name}</span>
                      <StatusBadge status={review.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-slate-400">by {reviewer}</span>
                    </div>
                    {review.title && <p className="text-xs font-medium text-slate-700 mt-1">{review.title}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{truncate(review.content, 80)}</p>
                    <div className="mt-2">
                      <ReviewActions reviewId={review.id} status={review.status} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
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
