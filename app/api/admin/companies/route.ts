import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { createSlug } from "@/lib/slugify";
import { CompanyStatus, ListingTier } from "@prisma/client";

type CreateCompanyBody = {
  name: string;
  slug?: string;
  tagline?: string | null;
  description?: string | null;
  yearFounded?: number | null;
  employeeCount?: string | null;
  status?: string;
  tier?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  contactName?: string | null;
  address?: string | null;
  stateId?: number | null;
  cityName?: string | null;
  zipCode?: string | null;
  linkedIn?: string | null;
  twitter?: string | null;
  facebook?: string | null;
  serviceArea?: string | null;
  logo?: string | null;
  coverImage?: string | null;
  serviceIds?: number[];
  metaTitle?: string | null;
  metaDescription?: string | null;
};

async function generateUniqueSlug(baseSlug: string): Promise<string> {
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const existing = await prisma.company.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = (await request.json()) as CreateCompanyBody;

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Resolve slug — ensure uniqueness
    const rawSlug = body.slug?.trim() || createSlug(body.name.trim());
    const slug = await generateUniqueSlug(rawSlug);

    // Resolve stateId / cityId
    let cityId: number | null = null;

    if (body.stateId && body.cityName?.trim()) {
      const citySlugVal = createSlug(body.cityName.trim());
      const existingCity = await prisma.city.findFirst({
        where: {
          stateId: body.stateId,
          slug: citySlugVal,
        },
        select: { id: true },
      });

      if (existingCity) {
        cityId = existingCity.id;
      } else {
        const newCity = await prisma.city.create({
          data: {
            name: body.cityName.trim(),
            slug: citySlugVal,
            stateId: body.stateId,
          },
          select: { id: true },
        });
        cityId = newCity.id;
      }
    }

    const company = await prisma.company.create({
      data: {
        name: body.name.trim(),
        slug,
        tagline: body.tagline ?? null,
        description: body.description ?? null,
        yearFounded: body.yearFounded ?? null,
        employeeCount: body.employeeCount ?? null,
        status: (body.status as CompanyStatus) ?? CompanyStatus.PENDING,
        tier: (body.tier as ListingTier) ?? ListingTier.FREE,
        isFeatured: body.isFeatured ?? false,
        isVerified: body.isVerified ?? false,
        email: body.email ?? null,
        phone: body.phone ?? null,
        website: body.website ?? null,
        contactName: body.contactName ?? null,
        address: body.address ?? null,
        stateId: body.stateId ?? null,
        cityId,
        zipCode: body.zipCode ?? null,
        linkedIn: body.linkedIn ?? null,
        twitter: body.twitter ?? null,
        facebook: body.facebook ?? null,
        serviceArea: body.serviceArea ?? null,
        logo: body.logo ?? null,
        coverImage: body.coverImage ?? null,
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
      },
    });

    // Create CompanyService records
    if (body.serviceIds && body.serviceIds.length > 0) {
      await prisma.companyService.createMany({
        data: body.serviceIds.map((categoryId) => ({
          companyId: company.id,
          categoryId,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/companies] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
