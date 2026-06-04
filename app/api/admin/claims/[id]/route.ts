import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import type { ClaimStatus } from "@prisma/client";

const ACTION_TO_STATUS: Record<string, ClaimStatus> = {
  approve: "APPROVED",
  reject: "REJECTED",
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();

    const body = await request.json() as {
      action: "approve" | "reject";
      adminNotes?: string;
    };

    const status = ACTION_TO_STATUS[body.action];
    if (!status) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    const claim = await prisma.companyOwnerClaim.findUnique({
      where: { id: params.id },
    });
    if (!claim) {
      return NextResponse.json({ error: "Claim not found" }, { status: 404 });
    }

    // Update claim
    const updatedClaim = await prisma.companyOwnerClaim.update({
      where: { id: params.id },
      data: {
        status,
        adminNotes: body.adminNotes ?? null,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
      },
    });

    // If approved, transfer company ownership
    if (status === "APPROVED") {
      await prisma.company.update({
        where: { id: claim.companyId },
        data: {
          ownerId: claim.userId,
          isClaimed: true,
        },
      });
    }

    return NextResponse.json(updatedClaim);
  } catch (error) {
    console.error("[admin/claims/[id] PATCH] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
