import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { FileText, Plus, Edit2 } from "lucide-react";
import { cn, formatDateShort, truncate } from "@/lib/utils";
import { DeletePageButton } from "@/components/admin/pages/DeletePageButton";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PUBLISHED: "bg-emerald-100 text-emerald-700",
    DRAFT: "bg-slate-100 text-slate-500",
    ARCHIVED: "bg-red-100 text-red-600",
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

export default async function AdminPagesPage() {
  await requireAdmin();

  const pages = await prisma.page.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      template: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <h1 className="font-display font-bold text-2xl text-primary">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Page
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No pages yet</p>
            <p className="text-slate-400 text-sm mt-1">Create your first page</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                    Slug
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                    Template
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                    Updated
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr
                    key={page.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/pages/${page.id}`}
                        className="font-medium text-slate-800 hover:text-teal-600 transition-colors"
                      >
                        {truncate(page.title, 60)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                      /{page.slug}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={page.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 capitalize">
                      {page.template ?? "default"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatDateShort(page.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/pages/${page.id}`}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </Link>
                        <DeletePageButton pageId={page.id} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
