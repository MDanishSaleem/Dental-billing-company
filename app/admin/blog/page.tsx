import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, Plus, ChevronLeft, ChevronRight, Edit2 } from "lucide-react";
import { cn, formatDateShort, truncate } from "@/lib/utils";
import { PostStatus } from "@prisma/client";
import { BlogDeleteButton } from "@/components/admin/blog/BlogDeleteButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    DRAFT: "bg-amber-100 text-amber-700",
    ARCHIVED: "bg-slate-100 text-slate-500",
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
        {Object.values(PostStatus).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button type="submit" className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
        Filter
      </button>
      {status && (
        <Link href="/admin/blog" className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:text-slate-700 flex items-center transition-colors">
          Clear
        </Link>
      )}
    </form>
  );
}

function Pagination({ page, totalPages, searchParams }: { page: number; totalPages: number; searchParams: Record<string, string> }) {
  function buildHref(p: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(p) });
    return `/admin/blog?${params.toString()}`;
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

export default async function AdminBlogPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const statusFilter = searchParams.status ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = statusFilter ? { status: statusFilter as PostStatus } : {};

  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
        category: { select: { name: true } },
        authorId: true,
      },
    }),
    prisma.blogPost.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const spRecord: Record<string, string> = {};
  if (statusFilter) spRecord.status = statusFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">Blog Posts</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString()} total posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Post
        </Link>
      </div>

      <FilterRow status={statusFilter} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No posts found</p>
            <p className="text-slate-400 text-sm mt-1">Create your first blog post</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Title</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Views</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Date</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/admin/blog/${post.id}`} className="font-medium text-slate-800 hover:text-teal-600 transition-colors text-sm">
                          {truncate(post.title, 60)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{post.category?.name ?? "—"}</td>
                      <td className="px-4 py-3"><StatusBadge status={post.status} /></td>
                      <td className="px-4 py-3 text-xs text-slate-500">{post.viewCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDateShort(post.publishedAt ?? post.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/blog/${post.id}`}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </Link>
                          <BlogDeleteButton postId={post.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {posts.map((post) => (
                <div key={post.id} className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/admin/blog/${post.id}`} className="font-semibold text-slate-800 hover:text-teal-600 text-sm">
                      {truncate(post.title, 50)}
                    </Link>
                    <StatusBadge status={post.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{post.category?.name ?? "Uncategorized"} · {post.viewCount} views · {formatDateShort(post.publishedAt ?? post.createdAt)}</p>
                  <div className="flex gap-2 mt-2">
                    <Link href={`/admin/blog/${post.id}`} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
                      <Edit2 className="w-3 h-3" /> Edit
                    </Link>
                    <BlogDeleteButton postId={post.id} />
                  </div>
                </div>
              ))}
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
