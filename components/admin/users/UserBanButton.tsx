"use client";

import { useState } from "react";

export function UserBanButton({ userId, isBanned }: { userId: string; isBanned: boolean }) {
  const [banned, setBanned] = useState(isBanned);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    const action = banned ? "unban" : "ban";
    if (!window.confirm(`${action === "ban" ? "Ban" : "Unban"} this user?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed");
      setBanned(!banned);
    } catch {
      alert("Failed to update user status. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={
        banned
          ? "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-50 transition-colors disabled:opacity-60"
          : "flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-60"
      }
    >
      {loading ? "…" : banned ? "Unban" : "Ban"}
    </button>
  );
}
