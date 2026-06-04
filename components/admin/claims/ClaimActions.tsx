"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ClaimActions({ claimId }: { claimId: string }) {
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  async function handleAction(action: "approve" | "reject") {
    const msg = action === "approve"
      ? "Approve this claim and set the claimant as company owner?"
      : "Reject this claim?";
    if (!window.confirm(msg)) return;
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/claims/${claimId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNotes: adminNotes || undefined }),
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
    } catch {
      alert("Action failed. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-2">
      <textarea
        value={adminNotes}
        onChange={(e) => setAdminNotes(e.target.value)}
        rows={2}
        placeholder="Admin notes (optional)…"
        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 resize-y"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleAction("approve")}
          disabled={loading !== null}
          className="px-3 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-60"
        >
          {loading === "approve" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => handleAction("reject")}
          disabled={loading !== null}
          className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
        >
          {loading === "reject" ? "Rejecting…" : "Reject"}
        </button>
      </div>
    </div>
  );
}
