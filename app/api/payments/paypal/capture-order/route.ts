import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { captureOrder } from "@/lib/paypal";

interface CustomIdPayload {
  planId: string;
  companyId: string;
  userId: string;
}

// PayPal redirects here with ?token=ORDER_ID after the buyer approves payment
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("token");

  if (!orderId) {
    return NextResponse.json({ error: "Missing token parameter" }, { status: 400 });
  }

  try {
    const captured = await captureOrder(orderId);

    if (captured.status !== "COMPLETED") {
      return NextResponse.json(
        { error: `Unexpected capture status: ${captured.status}` },
        { status: 400 }
      );
    }

    let parsed: CustomIdPayload;
    try {
      parsed = JSON.parse(captured.customId) as CustomIdPayload;
    } catch {
      return NextResponse.json({ error: "Invalid custom_id payload" }, { status: 400 });
    }

    const { planId, companyId, userId } = parsed;

    const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    const now = new Date();
    const isBillingAnnual = plan.billingCycle === "ANNUAL";
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + (isBillingAnnual ? 365 : 30));

    const isFeaturedTier = plan.tier === "FEATURED";

    await prisma.company.update({
      where: { id: companyId },
      data: {
        tier: plan.tier,
        premiumUntil: periodEnd,
        ...(isFeaturedTier
          ? { isFeatured: true, featuredUntil: periodEnd }
          : {}),
      },
    });

    await prisma.paymentTransaction.create({
      data: {
        userId,
        companyId,
        planId: plan.id,
        provider: "PAYPAL",
        providerTxId: orderId,
        amount: Number(captured.amount),
        currency: captured.currency,
        status: "COMPLETED",
        periodStart: now,
        periodEnd,
      },
    });

    redirect("/dashboard/subscription?success=paypal");
  } catch (error) {
    // next/navigation redirect throws internally — re-throw so Next.js handles it
    if (error instanceof Error && error.message === "NEXT_REDIRECT") {
      throw error;
    }
    console.error("[paypal/capture-order] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
