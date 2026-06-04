"use client";

import { useState } from "react";

export function PlanActiveToggle({ planId, isActive }: { planId: number; isActive: boolean }) {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/plans/${planId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });
      if (!res.ok) throw new Error("Failed");
      setActive(!active);
    } catch {
      alert("Failed to update plan status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      className={
        active
          ? "text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors disabled:opacity-60"
          : "text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors disabled:opacity-60"
      }
    >
      {loading ? "…" : active ? "Active" : "Inactive"}
    </button>
  );
}
