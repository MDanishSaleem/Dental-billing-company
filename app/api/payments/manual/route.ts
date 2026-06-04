import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { sendMail } from "@/lib/mailer";
import { getSetting } from "@/lib/settings";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { planId, companyId, notes } = await request.json() as {
      planId: string;
      companyId: string;
      notes?: string;
    };

    if (!planId || !companyId) {
      return NextResponse.json({ error: "planId and companyId are required" }, { status: 400 });
    }

    // Validate plan
    const plan = await prisma.plan.findUnique({ where: { id: Number(planId) } });
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Validate company ownership
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }
    if (company.ownerId !== session.user.id) {
      return NextResponse.json({ error: "You do not own this company" }, { status: 403 });
    }

    // Create pending transaction
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: session.user.id,
        companyId: company.id,
        planId: plan.id,
        provider: "MANUAL",
        amount: plan.price,
        currency: "USD",
        status: "PENDING",
        notes: notes ?? null,
      },
    });

    // Notify admin
    const adminEmail =
      (await getSetting("contact_email")) || process.env.SMTP_USER || "";
    if (adminEmail) {
      const userName = session.user.name ?? session.user.email ?? "Unknown user";
      await sendMail({
        to: adminEmail,
        subject: "New Manual Payment Submission",
        html: `
          <h2>New Manual Payment Submission</h2>
          <p><strong>User:</strong> ${userName} (${session.user.email})</p>
          <p><strong>Company:</strong> ${company.name}</p>
          <p><strong>Plan:</strong> ${plan.name}</p>
          <p><strong>Amount:</strong> $${Number(plan.price).toFixed(2)} USD</p>
          ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ""}
          <p>Please review and confirm payment in the admin panel.</p>
        `,
      });
    }

    return NextResponse.json({ id: transaction.id }, { status: 201 });
  } catch (error) {
    console.error("[payments/manual] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
