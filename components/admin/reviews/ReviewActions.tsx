"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReviewActions({ reviewId, status }: { reviewId: string; status: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  async function handleAction(action: "approve" | "reject" | "delete") {
    if (action === "delete" && !window.confirm("Delete this review permanently?")) return;
    setLoading(action);
    try {
      if (action === "delete") {
        const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed");
      } else {
        const res = await fetch(`/api/admin/reviews/${reviewId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (!res.ok) throw new Error("Failed");
      }
      router.refresh();
    } catch {
      alert("Action failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center justify-end gap-1.5 flex-wrap">
      {status !== "APPROVED" && (
        <button
          type="button"
          onClick={() => handleAction("approve")}
          disabled={loading !== null}
          className="px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-60"
        >
          {loading === "approve" ? "…" : "Approve"}
        </button>
      )}
      {status !== "REJECTED" && (
        <button
          type="button"
          onClick={() => handleAction("reject")}
          disabled={loading !== null}
          className="px-2.5 py-1.5 rounded-lg border border-amber-200 text-amber-700 text-xs font-semibold hover:bg-amber-50 transition-colors disabled:opacity-60"
        >
          {loading === "reject" ? "…" : "Reject"}
        </button>
      )}
      <button
        type="button"
        onClick={() => handleAction("delete")}
        disabled={loading !== null}
        className="px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
      >
        {loading === "delete" ? "…" : "Delete"}
      </button>
    </div>
  );
}
