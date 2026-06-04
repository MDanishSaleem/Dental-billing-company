import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import fs from "fs";

interface RouteContext {
  params: { id: string };
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const media = await prisma.media.findUnique({
      where: { id: params.id },
    });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Attempt to delete file from filesystem; ignore errors if not found
    try {
      await fs.promises.unlink(`${process.cwd()}/public${media.url}`);
    } catch {
      // File may already be missing — that's fine
    }

    await prisma.media.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/media/[id] DELETE] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
