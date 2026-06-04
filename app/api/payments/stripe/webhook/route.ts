import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[stripe/webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const { planId, companyId, userId } = session.metadata ?? {};

        if (!planId || !companyId || !userId) break;

        const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
        if (!plan) break;

        const now = new Date();
        const isBillingAnnual = plan.billingCycle === "ANNUAL";
        const periodEnd = new Date(now);
        periodEnd.setDate(periodEnd.getDate() + (isBillingAnnual ? 365 : 30));

        const isFeaturesTier = plan.tier === "FEATURED";

        await prisma.company.update({
          where: { id: companyId },
          data: {
            tier: plan.tier,
            premiumUntil: periodEnd,
            ...(isFeaturesTier
              ? { isFeatured: true, featuredUntil: periodEnd }
              : {}),
          },
        });

        await prisma.paymentTransaction.create({
          data: {
            userId,
            companyId,
            planId: plan.id,
            provider: "STRIPE",
            providerTxId: session.id,
            amount: (session.amount_total ?? 0) / 100,
            currency: (session.currency ?? "usd").toUpperCase(),
            status: "COMPLETED",
            periodStart: now,
            periodEnd,
          },
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subDetails = invoice.parent?.subscription_details;
        if (!subDetails) break;
        const subscriptionRaw = subDetails.subscription;
        const subscriptionId =
          typeof subscriptionRaw === "string"
            ? subscriptionRaw
            : subscriptionRaw?.id;
        if (!subscriptionId) break;

        // Retrieve subscription to get metadata
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const { planId, companyId } = subscription.metadata ?? {};
        if (!planId || !companyId) break;

        const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
        if (!plan) break;

        const company = await prisma.company.findUnique({ where: { id: companyId } });
        if (!company) break;

        const base = company.premiumUntil && company.premiumUntil > new Date()
          ? company.premiumUntil
          : new Date();
        const isBillingAnnual = plan.billingCycle === "ANNUAL";
        const newPremiumUntil = new Date(base);
        newPremiumUntil.setDate(newPremiumUntil.getDate() + (isBillingAnnual ? 365 : 30));

        await prisma.company.update({
          where: { id: companyId },
          data: { premiumUntil: newPremiumUntil },
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const { companyId } = subscription.metadata ?? {};
        if (!companyId) break;

        await prisma.company.update({
          where: { id: companyId },
          data: {
            tier: "FREE",
            isFeatured: false,
            premiumUntil: null,
            featuredUntil: null,
          },
        });
        break;
      }

      default:
        // Unhandled event type — return 200 anyway
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("[stripe/webhook] Handler error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
