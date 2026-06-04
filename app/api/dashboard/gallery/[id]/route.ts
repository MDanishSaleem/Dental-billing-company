import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAuth();
    const userId = session.user?.id;

    const galleryId = parseInt(params.id, 10);
    if (isNaN(galleryId)) {
      return NextResponse.json({ error: "Invalid gallery item id" }, { status: 400 });
    }

    // Find the gallery item and verify it belongs to the user's company
    const item = await prisma.companyGallery.findUnique({
      where: { id: galleryId },
      select: {
        id: true,
        company: { select: { ownerId: true } },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Gallery item not found" }, { status: 404 });
    }

    if (item.company.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.companyGallery.delete({ where: { id: galleryId } });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/dashboard/gallery/[id]] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
