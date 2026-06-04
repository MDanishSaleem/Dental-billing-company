"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type PageData = {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: string;
  template: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
};

interface PageFormProps {
  mode: "new" | "edit";
  page?: PageData;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PageForm({ mode, page }: PageFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [status, setStatus] = useState(page?.status ?? "DRAFT");
  const [template, setTemplate] = useState(page?.template ?? "default");
  const [content, setContent] = useState(page?.content ?? "");
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEdit);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugManuallyEdited && mode === "new") {
      setSlug(slugify(title));
    }
  }, [title, slugManuallyEdited, mode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      title,
      slug,
      content,
      status,
      template,
      metaTitle: metaTitle || null,
      metaDescription: metaDescription || null,
    };

    try {
      const url = isEdit ? `/api/admin/pages/${page!.id}` : "/api/admin/pages";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      router.push("/admin/pages");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">Page Details</h2>

        <div>
          <label className={labelClass}>
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Enter page title"
          />
        </div>

        <div>
          <label className={labelClass}>
            Slug <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugManuallyEdited(true);
            }}
            className={inputClass}
            placeholder="page-url-slug"
          />
          <p className="text-xs text-slate-400 mt-1">URL: /{slug || "page-slug"}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={inputClass}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className={inputClass}
            >
              <option value="default">Default</option>
              <option value="full-width">Full Width</option>
              <option value="landing">Landing</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={15}
            className={`${inputClass} resize-y font-mono`}
            placeholder="Write your page content here (HTML or Markdown)…"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-slate-800">SEO</h2>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelClass} style={{ marginBottom: 0 }}>
              Meta Title
            </label>
            <span
              className={`text-xs ${metaTitle.length > 55 ? "text-amber-500" : "text-slate-400"}`}
            >
              {metaTitle.length}/60
            </span>
          </div>
          <input
            type="text"
            value={metaTitle}
            onChange={(e) => setMetaTitle(e.target.value)}
            maxLength={60}
            className={inputClass}
            placeholder="SEO title (leave blank to use page title)"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className={labelClass} style={{ marginBottom: 0 }}>
              Meta Description
            </label>
            <span
              className={`text-xs ${metaDescription.length > 145 ? "text-amber-500" : "text-slate-400"}`}
            >
              {metaDescription.length}/160
            </span>
          </div>
          <textarea
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            maxLength={160}
            rows={3}
            className={`${inputClass} resize-y`}
            placeholder="SEO meta description"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="h-9 px-6 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors disabled:opacity-60"
        >
          {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Page"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/pages")}
          className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
