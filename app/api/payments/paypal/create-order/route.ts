import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { createOrder } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = (await request.json()) as { planId?: string; companyId?: string };
    const { planId, companyId } = body;

    if (!planId || !companyId) {
      return NextResponse.json(
        { error: "planId and companyId are required" },
        { status: 400 }
      );
    }

    // Fetch and validate plan
    const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    if (!plan.isActive) {
      return NextResponse.json({ error: "Plan is not active" }, { status: 400 });
    }

    // Fetch and validate company
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    if (company.ownerId !== session.user.id) {
      return NextResponse.json(
        { error: "You do not own this company" },
        { status: 403 }
      );
    }

    const order = await createOrder({
      amount: Number(plan.price),
      currency: "USD",
      planId: String(plan.id),
      companyId: company.id,
      userId: session.user.id,
      description: `${plan.name} — ${plan.billingCycle} plan for ${company.name}`,
    });

    return NextResponse.json({ orderId: order.id, approveUrl: order.approveUrl });
  } catch (error) {
    console.error("[paypal/create-order] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
