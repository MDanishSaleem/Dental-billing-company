"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteMediaButton({ mediaId }: { mediaId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!window.confirm("Delete this image permanently?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/media/${mediaId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Failed to delete image. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-60 shadow-sm"
      title="Delete image"
    >
      {loading ? (
        <span className="text-[10px]">…</span>
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </button>
  );
}
