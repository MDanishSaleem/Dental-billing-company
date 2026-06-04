import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export interface SearchParams {
  q?: string;
  city?: string;
  state?: string;
  zip?: string;
  service?: string;
  tier?: string;
  minRating?: number;
  page?: number;
  perPage?: number;
  sort?: "rating" | "reviews" | "newest" | "name";
}

export async function searchCompanies(params: SearchParams) {
  const {
    q,
    city,
    state,
    zip,
    service,
    tier,
    minRating,
    page = 1,
    perPage = 12,
    sort = "rating",
  } = params;

  const where: Prisma.CompanyWhereInput = {
    status: "ACTIVE",
  };

  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { tagline: { contains: q } },
    ];
  }

  if (state) {
    where.state = { slug: state };
  }

  if (city) {
    where.city = { slug: city };
  }

  if (zip) {
    where.zipCode = zip;
  }

  if (service) {
    where.services = {
      some: { category: { slug: service } },
    };
  }

  if (tier) {
    where.tier = tier as Prisma.EnumListingTierFilter["equals"];
  }

  if (minRating) {
    where.ratingAverage = { gte: minRating };
  }

  const orderBy: Prisma.CompanyOrderByWithRelationInput =
    sort === "rating"
      ? { ratingAverage: "desc" }
      : sort === "reviews"
      ? { reviewCount: "desc" }
      : sort === "newest"
      ? { createdAt: "desc" }
      : { name: "asc" };

  const [companies, total] = await Promise.all([
    prisma.company.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, orderBy],
      skip: (page - 1) * perPage,
      take: perPage,
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
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
        city: { select: { name: true, slug: true } },
        state: { select: { name: true, abbreviation: true, slug: true } },
        services: {
          take: 4,
          select: { category: { select: { name: true, slug: true, icon: true, color: true } } },
        },
      },
    }),
    prisma.company.count({ where }),
  ]);

  return {
    companies,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
  };
}
