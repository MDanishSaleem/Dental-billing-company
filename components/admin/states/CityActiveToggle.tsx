"use client";

import { useState } from "react";

interface CityActiveToggleProps {
  id: number;
  isActive: boolean;
}

export function CityActiveToggle({ id, isActive }: CityActiveToggleProps) {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !active }),
      });
      if (!res.ok) throw new Error("Failed");
      setActive(!active);
    } catch {
      alert("Failed to update city status.");
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
          : "text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-60"
      }
    >
      {loading ? "…" : active ? "Active" : "Inactive"}
    </button>
  );
}
