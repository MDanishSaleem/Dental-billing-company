import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { cn, formatCurrency, formatDateShort } from "@/lib/utils";
import { PaymentProvider, PaymentStatus } from "@prisma/client";
import { PaymentStatusDropdown } from "@/components/admin/payments/PaymentStatusDropdown";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    COMPLETED: "bg-emerald-100 text-emerald-700",
    PENDING: "bg-amber-100 text-amber-700",
    FAILED: "bg-red-100 text-red-700",
    REFUNDED: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", map[status] ?? "bg-slate-100 text-slate-500")}>
      {status}
    </span>
  );
}

function ProviderBadge({ provider }: { provider: string }) {
  const map: Record<string, string> = {
    STRIPE: "bg-purple-100 text-purple-700",
    PAYPAL: "bg-blue-100 text-blue-700",
    PAYONEER: "bg-orange-100 text-orange-700",
    MANUAL: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", map[provider] ?? "bg-slate-100 text-slate-500")}>
      {provider}
    </span>
  );
}

function FilterRow({ provider, status }: { provider: string; status: string }) {
  return (
    <form method="GET" className="flex flex-wrap gap-3 items-center">
      <select
        name="provider"
        defaultValue={provider}
        className="h-9 rounded-lg border border-slate-200 bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="">All Providers</option>
        {Object.values(PaymentProvider).map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <select
        name="status"
        defaultValue={status}
        className="h-9 rounded-lg border border-slate-200 bg-white text-sm px-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
      >
        <option value="">All Statuses</option>
        {Object.values(PaymentStatus).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <button type="submit" className="h-9 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
        Filter
      </button>
      {(provider || status) && (
        <Link href="/admin/payments" className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-sm text-slate-500 hover:text-slate-700 flex items-center transition-colors">
          Clear
        </Link>
      )}
    </form>
  );
}

function Pagination({ page, totalPages, searchParams }: { page: number; totalPages: number; searchParams: Record<string, string> }) {
  function buildHref(p: number) {
    const params = new URLSearchParams({ ...searchParams, page: String(p) });
    return `/admin/payments?${params.toString()}`;
  }
  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Link href={buildHref(page - 1)} aria-disabled={page <= 1} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors", page <= 1 ? "opacity-40 pointer-events-none border-slate-100 text-slate-400" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
          <ChevronLeft className="w-4 h-4" /> Prev
        </Link>
        <Link href={buildHref(page + 1)} aria-disabled={page >= totalPages} className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg border text-sm transition-colors", page >= totalPages ? "opacity-40 pointer-events-none border-slate-100 text-slate-400" : "border-slate-200 text-slate-600 hover:bg-slate-50")}>
          Next <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type SearchParams = { provider?: string; status?: string; page?: string };

export default async function AdminPaymentsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdmin();

  const providerFilter = searchParams.provider ?? "";
  const statusFilter = searchParams.status ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(providerFilter ? { provider: providerFilter as PaymentProvider } : {}),
    ...(statusFilter ? { status: statusFilter as PaymentStatus } : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.paymentTransaction.findMany({
      where,
      skip,
      take: PAGE_SIZE,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        provider: true,
        providerTxId: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        company: { select: { name: true } },
        plan: { select: { name: true } },
      },
    }),
    prisma.paymentTransaction.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const spRecord: Record<string, string> = {};
  if (providerFilter) spRecord.provider = providerFilter;
  if (statusFilter) spRecord.status = statusFilter;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-primary">Transactions</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total.toLocaleString()} total transactions</p>
        </div>
      </div>

      <FilterRow provider={providerFilter} status={statusFilter} />

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="w-10 h-10 text-slate-200 mb-3" />
            <p className="text-slate-500 font-medium">No transactions found</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">User</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Company</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Plan</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Amount</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Provider</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Date</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium text-slate-700">{tx.user.name ?? "—"}</p>
                        <p className="text-xs text-slate-400">{tx.user.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{tx.company?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-xs text-slate-500">{tx.plan?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-700">{formatCurrency(Number(tx.amount))}</td>
                      <td className="px-4 py-3"><ProviderBadge provider={tx.provider} /></td>
                      <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{formatDateShort(tx.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <PaymentStatusDropdown txId={tx.id} currentStatus={tx.status} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="font-medium text-slate-800 text-sm">{tx.user.name ?? tx.user.email}</span>
                    <div className="flex gap-1">
                      <ProviderBadge provider={tx.provider} />
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{tx.company?.name ?? "—"} · {tx.plan?.name ?? "—"}</p>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5">{formatCurrency(Number(tx.amount))} · {formatDateShort(tx.createdAt)}</p>
                  <div className="mt-2">
                    <PaymentStatusDropdown txId={tx.id} currentStatus={tx.status} />
                  </div>
                </div>
              ))}
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
