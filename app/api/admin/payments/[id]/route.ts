import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@prisma/client";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = params;
    const body = await request.json() as { status?: string };

    if (!body.status || !Object.values(PaymentStatus).includes(body.status as PaymentStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const tx = await prisma.paymentTransaction.findUnique({ where: { id }, select: { id: true } });
    if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    await prisma.paymentTransaction.update({ where: { id }, data: { status: body.status as PaymentStatus } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/payments/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
