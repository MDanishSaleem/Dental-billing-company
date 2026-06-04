import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid city ID" }, { status: 400 });
    }

    const body = await request.json() as {
      isActive?: boolean;
    };

    const existing = await prisma.city.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    const updated = await prisma.city.update({
      where: { id },
      data: {
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[admin/cities/[id] PATCH] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
