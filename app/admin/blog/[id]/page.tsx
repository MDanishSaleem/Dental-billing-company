import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BlogPostForm } from "@/components/admin/blog/BlogPostForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: { id: string };
}

export default async function AdminBlogEditPage({ params }: PageProps) {
  await requireAdmin();

  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        status: true,
        categoryId: true,
        metaTitle: true,
        metaDescription: true,
        publishedAt: true,
      },
    }),
    prisma.blogCategory.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!post) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-primary">Edit Post</h1>
        <p className="text-slate-500 text-sm mt-0.5">{post.title}</p>
      </div>
      <BlogPostForm categories={categories} post={post} />
    </div>
  );
}
