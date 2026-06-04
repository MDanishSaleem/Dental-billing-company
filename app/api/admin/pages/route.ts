import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { createSlug } from "@/lib/slugify";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const pageSize = 20;

    const [pages, total] = await Promise.all([
      prisma.page.findMany({
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          title: true,
          slug: true,
          status: true,
          template: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.page.count(),
    ]);

    return NextResponse.json({
      pages,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[admin/pages GET] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json() as {
      title: string;
      slug?: string;
      content?: string;
      status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      template?: string;
      metaTitle?: string;
      metaDescription?: string;
    };

    if (!body.title) {
      return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const slug = body.slug ? body.slug : createSlug(body.title);

    const createdPage = await prisma.page.create({
      data: {
        title: body.title,
        slug,
        content: body.content ?? "",
        status: body.status ?? "DRAFT",
        template: body.template ?? "default",
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
      },
    });

    return NextResponse.json(createdPage, { status: 201 });
  } catch (error) {
    console.error("[admin/pages POST] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
