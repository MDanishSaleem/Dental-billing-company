import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json() as {
      name: string;
      slug: string;
      icon?: string | null;
      color?: string | null;
      sortOrder?: number;
      isActive?: boolean;
    };

    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }

    const existing = await prisma.serviceCategory.findFirst({
      where: { OR: [{ name: body.name }, { slug: body.slug }] },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json({ error: "A category with this name or slug already exists" }, { status: 409 });
    }

    const category = await prisma.serviceCategory.create({
      data: {
        name: body.name.trim(),
        slug: body.slug.trim(),
        icon: body.icon ?? null,
        color: body.color ?? null,
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/admin/categories]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
