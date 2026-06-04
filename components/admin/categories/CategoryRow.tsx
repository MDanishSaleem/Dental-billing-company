"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
};

interface CategoryRowProps {
  category: Category;
  mobileOnly?: boolean;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryRow({ category, mobileOnly = false }: CategoryRowProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [slug, setSlug] = useState(category.slug);
  const [icon, setIcon] = useState(category.icon ?? "");
  const [color, setColor] = useState(category.color ?? "#6b7280");
  const [sortOrder, setSortOrder] = useState(String(category.sortOrder));
  const [isActive, setIsActive] = useState(category.isActive);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const inputClass = "h-7 px-2 rounded border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 w-full";

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          icon: icon || null,
          color: color || null,
          sortOrder: parseInt(sortOrder, 10),
          isActive,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setEditing(false);
      router.refresh();
    } catch {
      alert("Failed to save category.");
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setName(category.name);
    setSlug(category.slug);
    setIcon(category.icon ?? "");
    setColor(category.color ?? "#6b7280");
    setSortOrder(String(category.sortOrder));
    setIsActive(category.isActive);
    setEditing(false);
  }

  if (mobileOnly) {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
      </div>
    );
  }

  if (!editing) {
    return (
      <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
        <td className="px-4 py-3 font-medium text-slate-800 text-sm">{category.name}</td>
        <td className="px-4 py-3 text-slate-400 text-xs font-mono">{category.slug}</td>
        <td className="px-4 py-3 text-slate-500 text-xs">{category.icon ?? "—"}</td>
        <td className="px-4 py-3">
          {category.color ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded border border-slate-200" style={{ backgroundColor: category.color }} />
              <span className="text-xs text-slate-400 font-mono">{category.color}</span>
            </div>
          ) : "—"}
        </td>
        <td className="px-4 py-3 text-slate-500 text-xs">{category.sortOrder}</td>
        <td className="px-4 py-3">
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", category.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500")}>
            {category.isActive ? "Active" : "Inactive"}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              <Edit2 className="w-3 h-3" /> Edit
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-slate-50 bg-teal-50/30">
      <td className="px-4 py-2">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </td>
      <td className="px-4 py-2">
        <input value={slug} onChange={(e) => setSlug(e.target.value)} className={inputClass} />
      </td>
      <td className="px-4 py-2">
        <input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="icon-name" className={inputClass} />
      </td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-7 h-7 rounded border border-slate-200 cursor-pointer p-0.5 bg-white" />
          <input value={color} onChange={(e) => setColor(e.target.value)} className="h-7 px-2 rounded border border-slate-200 bg-white text-xs w-24 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
      </td>
      <td className="px-4 py-2">
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="h-7 px-2 rounded border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 w-16" />
      </td>
      <td className="px-4 py-2">
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-slate-300 text-teal-500 focus:ring-teal-500" />
          <span className="text-xs text-slate-600">Active</span>
        </label>
      </td>
      <td className="px-4 py-2">
        <div className="flex justify-end gap-1">
          <button type="button" onClick={handleSave} disabled={loading} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500 text-white text-xs font-semibold hover:bg-teal-600 transition-colors disabled:opacity-60">
            <Check className="w-3 h-3" /> {loading ? "…" : "Save"}
          </button>
          <button type="button" onClick={handleCancel} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors">
            <X className="w-3 h-3" /> Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}
