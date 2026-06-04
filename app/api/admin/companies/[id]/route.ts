import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { createSlug } from "@/lib/slugify";
import { CompanyStatus, ListingTier } from "@prisma/client";

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
      slug?: string;
      tagline?: string | null;
      description?: string | null;
      phone?: string | null;
      email?: string | null;
      website?: string | null;
      contactName?: string | null;
      address?: string | null;
      cityId?: number | null;
      cityName?: string | null;
      stateId?: number | null;
      zipCode?: string | null;
      yearFounded?: number | null;
      employeeCount?: string | null;
      tier?: string;
      status?: string;
      isFeatured?: boolean;
      isVerified?: boolean;
      metaTitle?: string | null;
      metaDescription?: string | null;
      linkedIn?: string | null;
      twitter?: string | null;
      facebook?: string | null;
      serviceArea?: string | null;
      logo?: string | null;
      coverImage?: string | null;
      serviceIds?: number[];
    };

    const company = await prisma.company.findUnique({ where: { id: params.id } });
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Resolve city if cityName provided
    let resolvedCityId: number | null | undefined = undefined;
    if (body.stateId && body.cityName?.trim()) {
      const citySlugVal = createSlug(body.cityName.trim());
      const existingCity = await prisma.city.findFirst({
        where: { stateId: body.stateId, slug: citySlugVal },
        select: { id: true },
      });
      if (existingCity) {
        resolvedCityId = existingCity.id;
      } else {
        const newCity = await prisma.city.create({
          data: { name: body.cityName.trim(), slug: citySlugVal, stateId: body.stateId },
          select: { id: true },
        });
        resolvedCityId = newCity.id;
      }
    } else if (body.cityId !== undefined) {
      resolvedCityId = body.cityId;
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.slug !== undefined ? { slug: body.slug } : {}),
        ...(body.tagline !== undefined ? { tagline: body.tagline } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
        ...(body.phone !== undefined ? { phone: body.phone } : {}),
        ...(body.website !== undefined ? { website: body.website } : {}),
        ...(body.contactName !== undefined ? { contactName: body.contactName } : {}),
        ...(body.address !== undefined ? { address: body.address } : {}),
        ...(resolvedCityId !== undefined ? { cityId: resolvedCityId } : {}),
        ...(body.stateId !== undefined ? { stateId: body.stateId } : {}),
        ...(body.zipCode !== undefined ? { zipCode: body.zipCode } : {}),
        ...(body.yearFounded !== undefined ? { yearFounded: body.yearFounded } : {}),
        ...(body.employeeCount !== undefined ? { employeeCount: body.employeeCount } : {}),
        ...(body.tier !== undefined ? { tier: body.tier as ListingTier } : {}),
        ...(body.status !== undefined ? { status: body.status as CompanyStatus } : {}),
        ...(body.isFeatured !== undefined ? { isFeatured: body.isFeatured } : {}),
        ...(body.isVerified !== undefined ? { isVerified: body.isVerified } : {}),
        ...(body.metaTitle !== undefined ? { metaTitle: body.metaTitle } : {}),
        ...(body.metaDescription !== undefined ? { metaDescription: body.metaDescription } : {}),
        ...(body.linkedIn !== undefined ? { linkedIn: body.linkedIn } : {}),
        ...(body.twitter !== undefined ? { twitter: body.twitter } : {}),
        ...(body.facebook !== undefined ? { facebook: body.facebook } : {}),
        ...(body.serviceArea !== undefined ? { serviceArea: body.serviceArea } : {}),
        ...(body.logo !== undefined ? { logo: body.logo } : {}),
        ...(body.coverImage !== undefined ? { coverImage: body.coverImage } : {}),
      },
    });

    // Update services if provided
    if (body.serviceIds !== undefined) {
      await prisma.companyService.deleteMany({ where: { companyId: params.id } });
      if (body.serviceIds.length > 0) {
        await prisma.companyService.createMany({
          data: body.serviceIds.map((categoryId) => ({
            companyId: params.id,
            categoryId,
          })),
          skipDuplicates: true,
        });
      }
    }

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
