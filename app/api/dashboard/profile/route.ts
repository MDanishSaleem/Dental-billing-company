import { NextRequest, NextResponse } from "next/server";
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
        tagline: true,
        description: true,
        phone: true,
        website: true,
        address: true,
        zipCode: true,
        yearFounded: true,
        employeeCount: true,
        coverImage: true,
      },
    });

    return NextResponse.json({ company });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user?.id;

    const company = await prisma.company.findFirst({
      where: { ownerId: userId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "No company found for this account." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      name,
      tagline,
      description,
      phone,
      website,
      address,
      zipCode,
      yearFounded,
      employeeCount,
      coverImage,
    } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Company name is required." },
        { status: 400 }
      );
    }

    const updated = await prisma.company.update({
      where: { id: company.id },
      data: {
        name: name.trim(),
        tagline: tagline?.trim() ?? null,
        description: description?.trim() ?? null,
        phone: phone?.trim() ?? null,
        website: website?.trim() ?? null,
        address: address?.trim() ?? null,
        zipCode: zipCode?.trim() ?? null,
        yearFounded: yearFounded ? Number(yearFounded) : null,
        employeeCount: employeeCount?.trim() ?? null,
        coverImage: coverImage?.trim() ?? null,
      },
      select: { id: true, name: true, updatedAt: true },
    });

    return NextResponse.json({ success: true, company: updated });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 }
    );
  }
}
