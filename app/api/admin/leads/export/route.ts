import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function escapeCsv(value: string | null | undefined): string {
  const str = value ?? "";
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  try {
    await requireAdmin();

    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        practiceName: true,
        serviceType: true,
        status: true,
        message: true,
        createdAt: true,
        company: { select: { name: true } },
      },
    });

    const headers = ["ID", "Company", "Name", "Email", "Phone", "Practice Name", "Service Type", "Status", "Message", "Date"];
    const rows = leads.map((lead) => [
      escapeCsv(lead.id),
      escapeCsv(lead.company.name),
      escapeCsv(lead.name),
      escapeCsv(lead.email),
      escapeCsv(lead.phone),
      escapeCsv(lead.practiceName),
      escapeCsv(lead.serviceType),
      escapeCsv(lead.status),
      escapeCsv(lead.message),
      escapeCsv(lead.createdAt.toISOString()),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/leads/export]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
