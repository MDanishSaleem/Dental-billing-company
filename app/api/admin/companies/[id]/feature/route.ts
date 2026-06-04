import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    const { isFeatured } = await request.json() as { isFeatured: boolean };

    const company = await prisma.company.findUnique({ where: { id: params.id } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        isFeatured,
        // If featuring a company that isn't at FEATURED tier, promote it
        ...(isFeatured && company.tier !== "FEATURED" ? { tier: "FEATURED" } : {}),
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("[admin/companies/[id]/feature] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
