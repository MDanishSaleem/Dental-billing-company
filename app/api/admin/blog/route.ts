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
    const statusFilter = searchParams.get("status");

    const where = statusFilter
      ? { status: statusFilter as "DRAFT" | "PUBLISHED" | "ARCHIVED" }
      : {};

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true },
      }),
      prisma.blogPost.count({ where }),
    ]);

    return NextResponse.json({
      posts,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[admin/blog GET] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const body = await request.json() as {
      title: string;
      slug?: string;
      excerpt?: string;
      content: string;
      coverImage?: string;
      categoryId?: number;
      status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      metaTitle?: string;
      metaDescription?: string;
    };

    if (!body.title || !body.content) {
      return NextResponse.json({ error: "title and content are required" }, { status: 400 });
    }

    const slug = body.slug ? body.slug : createSlug(body.title);

    const post = await prisma.blogPost.create({
      data: {
        title: body.title,
        slug,
        excerpt: body.excerpt ?? null,
        content: body.content,
        coverImage: body.coverImage ?? null,
        categoryId: body.categoryId ?? null,
        authorId: session.user.id,
        status: body.status ?? "DRAFT",
        metaTitle: body.metaTitle ?? null,
        metaDescription: body.metaDescription ?? null,
        publishedAt: body.status === "PUBLISHED" ? new Date() : null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[admin/blog POST] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
