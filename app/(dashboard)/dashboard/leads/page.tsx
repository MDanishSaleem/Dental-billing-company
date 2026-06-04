import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { formatDateShort, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Inbox } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads | Dashboard — DentalBillingCompany.us",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_VARIANT: Record<
  string,
  "teal" | "default" | "emerald_light" | "muted"
> = {
  NEW: "teal",
  CONTACTED: "default",
  CONVERTED: "emerald_light",
  ARCHIVED: "muted",
};

export default async function LeadsPage() {
  const session = await requireAuth();
  const userId = session.user?.id;

  const company = await prisma.company.findFirst({
    where: { ownerId: userId },
    select: { id: true, name: true },
  });

  if (!company) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Inbox className="w-10 h-10 text-slate-300 mb-4" />
        <h2 className="font-bold text-xl text-[#0F1F3D] mb-2">
          No company linked
        </h2>
        <p className="text-slate-500 text-sm">
          You need to claim or register a company to see leads.
        </p>
      </div>
    );
  }

  const leads = await prisma.lead.findMany({
    where: { companyId: company.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      practiceName: true,
      serviceType: true,
      message: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl text-[#0F1F3D]">Leads</h1>
        <p className="text-slate-500 text-sm mt-1">
          All inquiries submitted to your listing.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-10 h-10 text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700 mb-1">No leads yet</p>
            <p className="text-slate-400 text-sm">
              Leads will appear here once visitors contact you through your
              listing.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Practice
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Service
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Message
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{lead.name}</p>
                      <p className="text-xs text-slate-400">{lead.email}</p>
                      {lead.phone && (
                        <p className="text-xs text-slate-400">{lead.phone}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {lead.practiceName ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {lead.serviceType ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-slate-500 max-w-[200px]">
                      {truncate(lead.message, 80)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={STATUS_VARIANT[lead.status] ?? "muted"}
                        className="text-[11px]"
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-xs whitespace-nowrap">
                      {formatDateShort(lead.createdAt)}
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
