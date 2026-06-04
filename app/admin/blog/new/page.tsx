import { requireAdmin } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { BlogPostForm } from "@/components/admin/blog/BlogPostForm";

export const dynamic = "force-dynamic";

export default async function AdminBlogNewPage() {
  await requireAdmin();

  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display font-bold text-2xl text-primary">New Blog Post</h1>
        <p className="text-slate-500 text-sm mt-0.5">Create a new article for the blog</p>
      </div>
      <BlogPostForm categories={categories} />
    </div>
  );
}
