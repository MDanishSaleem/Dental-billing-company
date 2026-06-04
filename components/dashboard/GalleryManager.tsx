"use client";

import { useState } from "react";
import { Trash2, Plus, Image as ImageIcon, Loader2 } from "lucide-react";

type GalleryImage = {
  id: number;
  url: string;
  caption: string | null;
  sortOrder: number;
};

type Props = {
  companyId: string;
  initialImages: GalleryImage[];
};

export function GalleryManager({ initialImages }: Props) {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [newUrl, setNewUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  async function handleAdd() {
    if (!newUrl.trim()) return;
    setAdding(true);
    setAddError(null);

    try {
      const res = await fetch("/api/dashboard/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl.trim(), caption: newCaption.trim() || null }),
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to add image");
      }

      const data = (await res.json()) as GalleryImage;
      setImages((prev) => [...prev, data]);
      setNewUrl("");
      setNewCaption("");
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Failed to add image");
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/dashboard/gallery/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete image");
      }

      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeletingId(null);
    }
  }

  const inputClass =
    "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500";

  return (
    <div className="space-y-6">
      {/* Add Image Form */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-[#0F1F3D] text-base mb-4">
          Add Image
        </h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Image URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className={inputClass}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Caption
            </label>
            <input
              type="text"
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className={inputClass}
              placeholder="Optional caption for this image"
              maxLength={255}
            />
          </div>

          {addError && (
            <p className="text-sm text-red-600">{addError}</p>
          )}

          {/* Preview */}
          {newUrl && (
            <div>
              <p className="text-xs text-slate-500 mb-2">Preview:</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={newUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-xl border border-slate-200 bg-slate-50"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !newUrl.trim()}
            className="inline-flex items-center gap-2 h-9 px-5 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {adding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Image
              </>
            )}
          </button>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-[#0F1F3D] text-base mb-4">
          Gallery{" "}
          <span className="text-slate-400 font-normal text-sm">
            ({images.length} {images.length === 1 ? "image" : "images"})
          </span>
        </h2>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium text-sm">No images yet</p>
            <p className="text-slate-400 text-xs mt-1">
              Add your first gallery image above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div key={img.id} className="group relative">
                <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.caption ?? "Gallery image"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement;
                      el.src = "";
                      el.style.background = "#f1f5f9";
                    }}
                  />
                </div>
                {img.caption && (
                  <p className="text-xs text-slate-500 mt-1.5 truncate px-0.5">
                    {img.caption}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={deletingId === img.id}
                  className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-600 disabled:opacity-60 transition-all shadow-sm"
                  title="Delete image"
                >
                  {deletingId === img.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
