import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { CategoryRow } from "@/components/admin/categories/CategoryRow";
import { NewCategoryForm } from "@/components/admin/categories/NewCategoryForm";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  const categories = await prisma.serviceCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      color: true,
      sortOrder: true,
      isActive: true,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">Service Categories</h1>
          <p className="text-slate-500 text-sm mt-0.5">{categories.length} categories</p>
        </div>
      </div>

      {/* Add New Category */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Add New Category</h2>
        <NewCategoryForm />
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Tag className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No categories yet</p>
          </div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Slug</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Icon</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Color</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Sort</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Active</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <CategoryRow key={cat.id} category={cat} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile cards */}
        <div className={cn("md:hidden divide-y divide-slate-100", categories.length === 0 ? "hidden" : "")}>
          {categories.map((cat) => (
            <div key={cat.id} className="p-4">
              <div className="flex items-center gap-3">
                {cat.color && (
                  <div className="w-5 h-5 rounded shrink-0 border border-slate-200" style={{ backgroundColor: cat.color }} />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{cat.slug} · icon: {cat.icon ?? "—"} · sort: {cat.sortOrder}</p>
                </div>
              </div>
              <div className="mt-2">
                <CategoryRow key={`mobile-${cat.id}`} category={cat} mobileOnly />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
