"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_FLOW: Record<string, string> = {
  NEW: "CONTACTED",
  CONTACTED: "CONVERTED",
};

const NEXT_LABEL: Record<string, string> = {
  NEW: "Mark Contacted",
  CONTACTED: "Mark Converted",
};

export function LeadStatusButton({ leadId, currentStatus }: { leadId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const nextStatus = STATUS_FLOW[status];
  if (!nextStatus) {
    // Allow archive from any non-ARCHIVED status
    if (status === "ARCHIVED") return null;
    return (
      <button
        type="button"
        onClick={handleArchive}
        disabled={loading}
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
      >
        Archive
      </button>
    );
  }

  async function handleAdvance() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus(nextStatus);
      router.refresh();
    } catch {
      alert("Failed to update lead status.");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ARCHIVED" }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("ARCHIVED");
      router.refresh();
    } catch {
      alert("Failed to archive lead.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-1">
      <button
        type="button"
        onClick={handleAdvance}
        disabled={loading}
        className="px-2.5 py-1.5 rounded-lg border border-teal-200 text-teal-700 text-xs font-semibold hover:bg-teal-50 transition-colors disabled:opacity-60"
      >
        {loading ? "…" : (NEXT_LABEL[status] ?? "Advance")}
      </button>
      <button
        type="button"
        onClick={handleArchive}
        disabled={loading}
        className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-semibold hover:bg-slate-50 transition-colors disabled:opacity-60"
      >
        Archive
      </button>
    </div>
  );
}
