import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json() as {
      name?: string;
      tier?: string;
      price?: number;
      billingCycle?: string;
      features?: unknown;
      maxGalleryImages?: number;
      stripePriceId?: string;
      isActive?: boolean;
    };

    const plan = await prisma.plan.findUnique({ where: { id: Number(params.id) } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const updatedPlan = await prisma.plan.update({
      where: { id: Number(params.id) },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.tier !== undefined ? { tier: body.tier as never } : {}),
        ...(body.price !== undefined ? { price: body.price } : {}),
        ...(body.billingCycle !== undefined ? { billingCycle: body.billingCycle } : {}),
        ...(body.features !== undefined ? { features: body.features as never } : {}),
        ...(body.maxGalleryImages !== undefined
          ? { maxGalleryImages: body.maxGalleryImages }
          : {}),
        ...(body.stripePriceId !== undefined ? { stripePriceId: body.stripePriceId } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      },
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("[admin/plans/[id] PATCH] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
