import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import type { CompanyStatus } from "@prisma/client";

const ACTION_TO_STATUS: Record<string, CompanyStatus> = {
  approve: "ACTIVE",
  reject: "REJECTED",
  suspend: "SUSPENDED",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { action } = await request.json() as { action: "approve" | "reject" | "suspend" };

    const status = ACTION_TO_STATUS[action];
    if (!status) {
      return NextResponse.json(
        { error: `Invalid action. Must be one of: ${Object.keys(ACTION_TO_STATUS).join(", ")}` },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({ where: { id: params.id } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("[admin/companies/[id]/approve] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
