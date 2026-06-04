import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { createSlug } from "@/lib/slugify";

type ImportRow = {
  name: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  yearFounded?: string;
  employeeCount?: string;
  services?: string[];
};

type ImportError = {
  row: number;
  message: string;
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

    const body = (await request.json()) as { rows: ImportRow[] };

    if (!body.rows || !Array.isArray(body.rows)) {
      return NextResponse.json(
        { error: "rows array is required" },
        { status: 400 }
      );
    }

    let imported = 0;
    const errors: ImportError[] = [];

    for (let i = 0; i < body.rows.length; i++) {
      const row = body.rows[i];
      const rowNum = i + 1;

      if (!row.name?.trim()) {
        errors.push({ row: rowNum, message: "name is required" });
        continue;
      }

      try {
        // Resolve state
        let stateId: number | null = null;
        if (row.state?.trim()) {
          const stateSearch = row.state.trim();
          const stateRecord = await prisma.state.findFirst({
            where: {
              OR: [
                { name: { equals: stateSearch } },
                { abbreviation: { equals: stateSearch.toUpperCase() } },
              ],
            },
            select: { id: true },
          });
          if (stateRecord) {
            stateId = stateRecord.id;
          }
        }

        // Find or create city
        let cityId: number | null = null;
        if (stateId && row.city?.trim()) {
          const citySlugVal = createSlug(row.city.trim());
          const existingCity = await prisma.city.findFirst({
            where: { stateId, slug: citySlugVal },
            select: { id: true },
          });
          if (existingCity) {
            cityId = existingCity.id;
          } else {
            const newCity = await prisma.city.create({
              data: {
                name: row.city.trim(),
                slug: citySlugVal,
                stateId,
              },
              select: { id: true },
            });
            cityId = newCity.id;
          }
        }

        // Generate unique slug (upsert by slug)
        const baseSlug = createSlug(row.name.trim());
        const slug = await generateUniqueSlug(baseSlug);

        const company = await prisma.company.upsert({
          where: { slug: baseSlug },
          update: {},
          create: {
            name: row.name.trim(),
            slug,
            tagline: row.tagline?.trim() ?? null,
            description: row.description?.trim() ?? null,
            email: row.email?.trim() ?? null,
            phone: row.phone?.trim() ?? null,
            website: row.website?.trim() ?? null,
            zipCode: row.zipCode?.trim() ?? null,
            yearFounded: row.yearFounded ? parseInt(row.yearFounded, 10) || null : null,
            employeeCount: row.employeeCount?.trim() ?? null,
            stateId,
            cityId,
            status: "PENDING",
            tier: "FREE",
          },
        });

        // Link services by slug
        if (row.services && row.services.length > 0) {
          for (const svcSlug of row.services) {
            const cat = await prisma.serviceCategory.findUnique({
              where: { slug: svcSlug.trim() },
              select: { id: true },
            });
            if (cat) {
              await prisma.companyService.upsert({
                where: {
                  companyId_categoryId: {
                    companyId: company.id,
                    categoryId: cat.id,
                  },
                },
                update: {},
                create: { companyId: company.id, categoryId: cat.id },
              });
            }
          }
        }

        imported++;
      } catch (err) {
        errors.push({
          row: rowNum,
          message:
            err instanceof Error ? err.message : "Failed to import row",
        });
      }
    }

    return NextResponse.json({ imported, errors }, { status: 200 });
  } catch (error) {
    console.error("[POST /api/admin/companies/import] error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
