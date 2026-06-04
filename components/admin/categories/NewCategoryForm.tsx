"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function NewCategoryForm() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [color, setColor] = useState("#0d9488");
  const [sortOrder, setSortOrder] = useState("0");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setName(e.target.value);
    if (!slugManuallyEdited) {
      setSlug(slugify(e.target.value));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug || slugify(name),
          icon: icon || null,
          color: color || null,
          sortOrder: parseInt(sortOrder, 10) || 0,
          isActive: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create");
      setName("");
      setSlug("");
      setIcon("");
      setColor("#0d9488");
      setSortOrder("0");
      setSlugManuallyEdited(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            required
            placeholder="e.g. Insurance Billing"
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
            placeholder="insurance-billing"
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Icon</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="shield-check"
            className={`${inputClass} w-full`}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white" />
            <input value={color} onChange={(e) => setColor(e.target.value)} className={`${inputClass} flex-1 min-w-0`} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm w-20 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 h-9 px-4 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          {loading ? "Adding…" : "Add Category"}
        </button>
      </div>
    </form>
  );
}
