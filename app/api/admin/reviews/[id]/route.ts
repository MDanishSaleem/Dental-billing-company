import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = params;
    const body = await request.json() as { action?: string };

    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true, companyId: true, rating: true, status: true },
    });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    if (body.action === "approve") {
      await prisma.review.update({ where: { id }, data: { status: "APPROVED" } });

      // Recalculate company rating
      const agg = await prisma.review.aggregate({
        where: { companyId: review.companyId, status: "APPROVED" },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await prisma.company.update({
        where: { id: review.companyId },
        data: {
          ratingAverage: agg._avg.rating ?? 0,
          reviewCount: agg._count.rating,
        },
      });
      return NextResponse.json({ success: true });
    }

    if (body.action === "reject") {
      const wasApproved = review.status === "APPROVED";
      await prisma.review.update({ where: { id }, data: { status: "REJECTED" } });

      if (wasApproved) {
        const agg = await prisma.review.aggregate({
          where: { companyId: review.companyId, status: "APPROVED" },
          _avg: { rating: true },
          _count: { rating: true },
        });
        await prisma.company.update({
          where: { id: review.companyId },
          data: {
            ratingAverage: agg._avg.rating ?? 0,
            reviewCount: agg._count.rating,
          },
        });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    console.error("[PATCH /api/admin/reviews/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = params;

    const review = await prisma.review.findUnique({
      where: { id },
      select: { id: true, companyId: true, status: true },
    });
    if (!review) return NextResponse.json({ error: "Review not found" }, { status: 404 });

    const wasApproved = review.status === "APPROVED";
    await prisma.review.delete({ where: { id } });

    if (wasApproved) {
      const agg = await prisma.review.aggregate({
        where: { companyId: review.companyId, status: "APPROVED" },
        _avg: { rating: true },
        _count: { rating: true },
      });
      await prisma.company.update({
        where: { id: review.companyId },
        data: {
          ratingAverage: agg._avg.rating ?? 0,
          reviewCount: agg._count.rating,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/reviews/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
