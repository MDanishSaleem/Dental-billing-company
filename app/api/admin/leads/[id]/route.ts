import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { LeadStatus } from "@prisma/client";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = params;
    const body = await request.json() as { status?: string };

    if (!body.status || !Object.values(LeadStatus).includes(body.status as LeadStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const lead = await prisma.lead.findUnique({ where: { id }, select: { id: true } });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    await prisma.lead.update({ where: { id }, data: { status: body.status as LeadStatus } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/leads/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
