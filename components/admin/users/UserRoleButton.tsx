"use client";

import { useState } from "react";

const ROLES = ["ADMIN", "COMPANY_OWNER", "USER"] as const;
type Role = (typeof ROLES)[number];

export function UserRoleButton({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState<string>(currentRole);
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as Role;
    if (newRole === role) return;
    if (!window.confirm(`Change role to ${newRole.replace("_", " ")}?`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Failed");
      setRole(newRole);
    } catch {
      alert("Failed to update role. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={role}
      onChange={handleChange}
      disabled={loading}
      className="h-7 px-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
    >
      {ROLES.map((r) => (
        <option key={r} value={r}>{r.replace("_", " ")}</option>
      ))}
    </select>
  );
}
