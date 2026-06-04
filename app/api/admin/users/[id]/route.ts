import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

interface RouteParams {
  params: { id: string };
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = params;
    const body = await request.json() as { action?: string; role?: string };

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (body.action === "ban") {
      await prisma.user.update({ where: { id }, data: { isBanned: true } });
      return NextResponse.json({ success: true });
    }

    if (body.action === "unban") {
      await prisma.user.update({ where: { id }, data: { isBanned: false } });
      return NextResponse.json({ success: true });
    }

    if (body.role && Object.values(Role).includes(body.role as Role)) {
      await prisma.user.update({ where: { id }, data: { role: body.role as Role } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action or role" }, { status: 400 });
  } catch (err) {
    console.error("[PATCH /api/admin/users/[id]]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
