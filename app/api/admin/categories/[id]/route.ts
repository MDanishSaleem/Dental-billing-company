import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });

    const cat = await prisma.serviceCategory.findUnique({ where: { id }, select: { id: true } });
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    const body = await request.json() as {
      name?: string;
      slug?: string;
      icon?: string | null;
      color?: string | null;
      sortOrder?: number;
      isActive?: boolean;
    };

    const updated = await prisma.serviceCategory.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.slug !== undefined ? { slug: body.slug } : {}),
        ...(body.icon !== undefined ? { icon: body.icon } : {}),
        ...(body.color !== undefined ? { color: body.color } : {}),
        ...(body.sortOrder !== undefined ? { sortOrder: body.sortOrder } : {}),
        ...(body.isActive !== undefined ? { isActive: body.isActive } : {}),
      },
      select: { id: true, name: true, slug: true },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (err) {
    console.error("[PATCH /api/admin/categories/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const id = parseInt(params.id, 10);
    if (isNaN(id)) return NextResponse.json({ error: "Invalid category ID" }, { status: 400 });

    const cat = await prisma.serviceCategory.findUnique({ where: { id }, select: { id: true } });
    if (!cat) return NextResponse.json({ error: "Category not found" }, { status: 404 });

    await prisma.serviceCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/admin/categories/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
