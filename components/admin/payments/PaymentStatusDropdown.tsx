"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING", "COMPLETED", "FAILED", "REFUNDED"] as const;
type Status = (typeof STATUSES)[number];

export function PaymentStatusDropdown({ txId, currentStatus }: { txId: string; currentStatus: string }) {
  const [status, setStatus] = useState<string>(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value as Status;
    if (newStatus === status) return;
    if (!window.confirm(`Change status to ${newStatus}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/payments/${txId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus(newStatus);
      router.refresh();
    } catch {
      alert("Failed to update payment status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}
