import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user?.id;

    const body = (await request.json()) as {
      companyId: string;
      evidence: string;
    };

    if (!body.companyId?.trim()) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    if (!body.evidence?.trim() || body.evidence.trim().length < 10) {
      return NextResponse.json(
        { error: "evidence is required (minimum 10 characters)" },
        { status: 400 }
      );
    }

    // Check company exists and is ACTIVE
    const company = await prisma.company.findUnique({
      where: { id: body.companyId },
      select: { id: true, status: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    if (company.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Claims can only be submitted for active company listings" },
        { status: 400 }
      );
    }

    // Check for existing PENDING claim from this user
    const existingClaim = await prisma.companyOwnerClaim.findFirst({
      where: {
        companyId: body.companyId,
        userId,
        status: "PENDING",
      },
      select: { id: true },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "You already have a pending claim for this company" },
        { status: 409 }
      );
    }

    const claim = await prisma.companyOwnerClaim.create({
      data: {
        companyId: body.companyId,
        userId: userId!,
        status: "PENDING",
        evidence: body.evidence.trim(),
      },
    });

    return NextResponse.json(claim, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/claim] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
