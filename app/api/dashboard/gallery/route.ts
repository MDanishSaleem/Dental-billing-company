import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user?.id;

    const company = await prisma.company.findFirst({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "No company found for this account" },
        { status: 404 }
      );
    }

    const body = (await request.json()) as { url: string; caption?: string | null };

    if (!body.url?.trim()) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    // Get max sortOrder for ordering
    const last = await prisma.companyGallery.findFirst({
      where: { companyId: company.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });
    const sortOrder = (last?.sortOrder ?? 0) + 1;

    const image = await prisma.companyGallery.create({
      data: {
        companyId: company.id,
        url: body.url.trim(),
        caption: body.caption?.trim() ?? null,
        sortOrder,
      },
    });

    return NextResponse.json(image, { status: 201 });
  } catch (error) {
    console.error("[POST /api/dashboard/gallery] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
