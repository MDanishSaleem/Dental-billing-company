import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { slug: string };
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { slug } = params;

    if (!slug) {
      return NextResponse.json(
        { error: "Slug is required" },
        { status: 400 }
      );
    }

    const company = await prisma.company.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        description: true,
        logo: true,
        coverImage: true,
        ratingAverage: true,
        reviewCount: true,
        tier: true,
        isFeatured: true,
        isVerified: true,
        phone: true,
        website: true,
        yearFounded: true,
        employeeCount: true,
        address: true,
        zipCode: true,
        city: { select: { name: true, slug: true } },
        state: { select: { name: true, abbreviation: true, slug: true } },
        services: {
          select: {
            category: {
              select: { id: true, name: true, slug: true, icon: true, color: true },
            },
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error("[GET /api/companies/[slug]]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
