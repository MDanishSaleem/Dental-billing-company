import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await requireAuth();
    const userId = session.user?.id;

    const company = await prisma.company.findFirst({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        tier: true,
        premiumUntil: true,
        featuredUntil: true,
      },
    });

    if (!company) {
      return NextResponse.json({ company: null, transactions: [] });
    }

    const transactions = await prisma.paymentTransaction.findMany({
      where: { companyId: company.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
        provider: true,
        createdAt: true,
        plan: { select: { name: true } },
      },
    });

    return NextResponse.json({
      company: {
        name: company.name,
        tier: company.tier,
        premiumUntil: company.premiumUntil?.toISOString() ?? null,
        featuredUntil: company.featuredUntil?.toISOString() ?? null,
      },
      transactions: transactions.map((tx) => ({
        ...tx,
        amount: tx.amount.toString(),
        createdAt: tx.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
