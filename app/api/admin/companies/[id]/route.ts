import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        city: true,
        state: true,
        owner: { select: { id: true, name: true, email: true } },
        services: { include: { category: true } },
        gallery: true,
        reviews: { orderBy: { createdAt: "desc" }, take: 10 },
        leads: { orderBy: { createdAt: "desc" }, take: 10 },
        transactions: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("[admin/companies/[id] GET] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json() as {
      name?: string;
      tagline?: string;
      description?: string;
      phone?: string;
      website?: string;
      address?: string;
      cityId?: number;
      stateId?: number;
      zipCode?: string;
      yearFounded?: number;
      employeeCount?: string;
      tier?: string;
      status?: string;
      isFeatured?: boolean;
      isVerified?: boolean;
      metaTitle?: string;
      metaDescription?: string;
    };

    const company = await prisma.company.findUnique({ where: { id: params.id } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.tagline !== undefined ? { tagline: body.tagline } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.website !== undefined ? { website: body.website } : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),
        ...(body.cityId !== undefined ? { cityId: body.cityId } : {}),
        ...(body.stateId !== undefined ? { stateId: body.stateId } : {}),
        ...(body.zipCode !== undefined ? { zipCode: body.zipCode } : {}),
        ...(body.yearFounded !== undefined ? { yearFounded: body.yearFounded } : {}),
        ...(body.employeeCount !== undefined ? { employeeCount: body.employeeCount } : {}),
        ...(body.tier !== undefined ? { tier: body.tier as never } : {}),
        ...(body.status !== undefined ? { status: body.status as never } : {}),
        ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
        ...(body.isVerified !== undefined ? { isVerified: body.isVerified } : {}),
        ...(body.metaTitle !== undefined ? { metaTitle: body.metaTitle } : {}),
        ...(body.metaDescription !== undefined ? { metaDescription: body.metaDescription } : {}),
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("[admin/companies/[id] PATCH] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const company = await prisma.company.findUnique({ where: { id: params.id } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    await prisma.company.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[admin/companies/[id] DELETE] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
