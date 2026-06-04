import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { requireAuth } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { planId, companyId } = await request.json() as { planId: string; companyId: string };

    if (!planId || !companyId) {
      return NextResponse.json({ error: "planId and companyId are required" }, { status: 400 });
    }

    // Fetch and validate plan
    const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }
    if (!plan.isActive) {
      return NextResponse.json({ error: "Plan is not active" }, { status: 400 });
    }
    if (!plan.stripePriceId) {
      return NextResponse.json({ error: "Plan has no Stripe price configured" }, { status: 400 });
    }

    // Fetch and validate company
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    if (company.ownerId !== session.user.id) {
      return NextResponse.json({ error: "You do not own this company" }, { status: 403 });
    }

    const baseUrl = process.env.NEXTAUTH_URL ?? "https://dentalbillingcompany.us";

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: plan.stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/subscription?success=1`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: {
        planId: String(plan.id),
        companyId: company.id,
        userId: session.user.id,
      },
      client_reference_id: session.user.id,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("[stripe/checkout] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
