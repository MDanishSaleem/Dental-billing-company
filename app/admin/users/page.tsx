import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Search, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, generateInitials, getInitialColor, formatDateShort } from "@/lib/utils";
import { Role } from "@prisma/client";
import { UserRoleButton } from "@/components/admin/users/UserRoleButton";
import { UserBanButton } from "@/components/admin/users/UserBanButton";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    COMPANY_OWNER: "bg-teal-100 text-teal-700",
    USER: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", map[role] ?? "bg-slate-100 text-slate-500")}>
      {role.replace("_", " ")}
    </span>
  );
}

function FilterRow({ q, role }: { q: string; role: string }) {
  return (
    <form method="GET" className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 h-9 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        />
      </div>
      <select
        name="role"
        defaultValue={role}
        className="h-9 rounded-lg border border-slate-200 bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="">All Roles</option>
        {Object.values(Role).map((r) => (
          <option key={r} value={r}>{r.replace("_", " ")}</option>
        ))}
      </select>
      <button type="submit" className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
        Filter
      </button>
      {(q || role) && (
        <Link href="/admin/users" className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:text-slate-700 flex items-center transition-colors">
          Clear
        </Link>
      )}
    </form>
  );
}

function Pagination({ page, totalPages, searchParams }: { page: number; totalPages: number; searchParams: Record<string, string> }) {
  function buildHref(p: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(p) });
    return `/admin/users?${params.toString()}`;
  }
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Link
          href={buildHref(page - 1)}
          aria-disabled={page <= 1}
          className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors", page <= 1 ? "opacity-40 pointer-events-none border-slate-100 text-slate-400" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Link>
        <Link
          href={buildHref(page + 1)}
          aria-disabled={page >= totalPages}
          className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors", page >= totalPages ? "opacity-40 pointer-events-none border-slate-100 text-slate-400" : "border-slate-200 text-slate-600 hover:bg-slate-50")}
        >
          Next <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SearchParams = { q?: string; role?: string; page?: string };

export default async function AdminUsersPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const q = searchParams.q ?? "";
  const roleFilter = searchParams.role ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : {}),
    ...(roleFilter ? { role: roleFilter as Role } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isBanned: true,
        emailVerified: true,
        createdAt: true,
        avatar: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const spRecord: Record<string, string> = {};
  if (q) spRecord.q = q;
  if (roleFilter) spRecord.role = roleFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">Users</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString()} total users</p>
        </div>
      </div>

      <FilterRow q={q} role={roleFilter} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No users found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Role</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Joined</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const displayName = user.name ?? "Unnamed";
                    const initials = generateInitials(displayName);
                    const bgColor = getInitialColor(displayName);
                    return (
                      <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", bgColor)}>
                              {initials}
                            </div>
                            <span className="font-medium text-slate-800">{displayName}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">{user.email}</td>
                        <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                        <td className="px-4 py-3">
                          {user.isBanned ? (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Banned</span>
                          ) : user.emailVerified ? (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Verified</span>
                          ) : (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Unverified</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">{formatDateShort(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <UserRoleButton userId={user.id} currentRole={user.role} />
                            <UserBanButton userId={user.id} isBanned={user.isBanned} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {users.map((user) => {
                const displayName = user.name ?? "Unnamed";
                const initials = generateInitials(displayName);
                const bgColor = getInitialColor(displayName);
                return (
                  <div key={user.id} className="p-4 flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", bgColor)}>
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800 text-sm">{displayName}</span>
                        <RoleBadge role={user.role} />
                        {user.isBanned && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Banned</span>}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{user.email} · {formatDateShort(user.createdAt)}</p>
                      <div className="flex gap-2 mt-2">
                        <UserRoleButton userId={user.id} currentRole={user.role} />
                        <UserBanButton userId={user.id} isBanned={user.isBanned} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {totalPages > 1 && (
          <div className="px-4 pb-4">
            <Pagination page={page} totalPages={totalPages} searchParams={spRecord} />
          </div>
        )}
      </div>
    </div>
  );
}
