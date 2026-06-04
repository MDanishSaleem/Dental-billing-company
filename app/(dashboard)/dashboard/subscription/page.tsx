"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CreditCard, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateShort, formatCurrency } from "@/lib/utils";

type CompanyInfo = {
  name: string;
  tier: string;
  premiumUntil: string | null;
  featuredUntil: string | null;
};

type Transaction = {
  id: string;
  amount: string;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
  plan: { name: string } | null;
};

const TIER_LABEL: Record<string, string> = {
  FREE: "Free",
  BASIC: "Basic",
  PREMIUM: "Premium",
  FEATURED: "Featured",
};

const TIER_VARIANT: Record<string, "muted" | "teal" | "default" | "gold_solid"> = {
  FREE: "muted",
  BASIC: "teal",
  PREMIUM: "default",
  FEATURED: "gold_solid",
};

const TX_STATUS_VARIANT: Record<string, "emerald_light" | "gold" | "muted" | "destructive"> = {
  COMPLETED: "emerald_light",
  PENDING: "gold",
  FAILED: "destructive",
  REFUNDED: "muted",
};

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch("/api/dashboard/subscription")
      .then((r) => r.json())
      .then((data) => {
        if (data.company) setCompany(data.company);
        if (data.transactions) setTransactions(data.transactions);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  const tier = company?.tier ?? "FREE";
  const expiry = company?.premiumUntil ?? company?.featuredUntil;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-bold text-2xl text-[#0F1F3D]">Subscription</h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your listing plan and billing history.
        </p>
      </div>

      {/* Current Plan */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0F1F3D]/10 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-[#0F1F3D]" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide mb-1">
                Current Plan
              </p>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#0F1F3D] text-xl">
                  {TIER_LABEL[tier] ?? tier}
                </span>
                <Badge
                  variant={TIER_VARIANT[tier] ?? "muted"}
                  className="text-[11px]"
                >
                  {tier}
                </Badge>
              </div>
              {expiry ? (
                <p className="text-sm text-slate-500 mt-0.5">
                  Active until{" "}
                  <span className="font-semibold text-slate-700">
                    {formatDateShort(expiry)}
                  </span>
                </p>
              ) : tier === "FREE" ? (
                <p className="text-sm text-slate-400 mt-0.5">
                  Upgrade to unlock premium features
                </p>
              ) : (
                <p className="text-sm text-slate-400 mt-0.5">
                  No expiry set
                </p>
              )}
            </div>
          </div>

          {tier !== "FEATURED" && (
            <Button asChild variant="teal" size="sm">
              <Link href="/pricing">
                Upgrade Plan
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </Button>
          )}
        </div>

        {tier === "FREE" && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              What you get with Premium:
            </p>
            <ul className="space-y-2">
              {[
                "Priority placement in search results",
                "Detailed analytics and lead tracking",
                "Verified badge on your listing",
                "Unlimited gallery images",
                "Featured company highlights",
              ].map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-2 text-sm text-slate-600"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <Button asChild variant="teal">
                <Link href="/pricing">View Pricing Plans</Link>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="font-semibold text-[#0F1F3D] text-base mb-4">
          Payment History
        </h2>
        {transactions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">
            No payment history found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="text-left py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Plan
                  </th>
                  <th className="text-left py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Provider
                  </th>
                  <th className="text-left py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left py-2.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50">
                    <td className="py-3 text-slate-500">
                      {formatDateShort(tx.createdAt)}
                    </td>
                    <td className="py-3 font-medium text-slate-800">
                      {tx.plan?.name ?? "—"}
                    </td>
                    <td className="py-3 text-slate-500">{tx.provider}</td>
                    <td className="py-3 font-semibold text-slate-800">
                      {formatCurrency(Number(tx.amount))}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={TX_STATUS_VARIANT[tx.status] ?? "muted"}
                        className="text-[11px]"
                      >
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
