import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { buildBlogPostSchema, buildBreadcrumbSchema } from "@/lib/structured-data";
import { buildMeta } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";
import { Eye, Calendar, ChevronRight, Tag } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 86400;

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      excerpt: true,
      metaTitle: true,
      metaDescription: true,
      coverImage: true,
      slug: true,
    },
  });

  if (!post) {
    return buildMeta({
      title: "Post Not Found | DentalBillingCompany.us",
      description: "The requested blog post could not be found.",
    });
  }

  return buildMeta({
    title: post.metaTitle ?? post.title,
    description:
      post.metaDescription ??
      post.excerpt ??
      `Read ${post.title} on DentalBillingCompany.us`,
    canonical: `/blog/${post.slug}`,
    image: post.coverImage ?? undefined,
  });
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const post = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      status: true,
      viewCount: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      authorId: true,
      category: { select: { name: true, slug: true } },
    },
  });

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  // Increment view count (fire and forget)
  prisma.blogPost
    .update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(console.error);

  const publishDate = post.publishedAt ?? post.createdAt;

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  const blogPostSchema = buildBlogPostSchema({
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    authorId: post.authorId,
  });

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(blogPostSchema),
        }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-700 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blog" className="hover:text-slate-700 transition-colors">
            Blog
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 font-medium truncate max-w-[200px]">
            {post.title}
          </span>
        </nav>

        {/* Category badge */}
        {post.category && (
          <div className="mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-100">
              <Tag className="w-3 h-3" />
              {post.category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="font-bold text-3xl sm:text-4xl text-[#0F1F3D] leading-tight mb-5">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-8 pb-6 border-b border-slate-100">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(publishDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            {post.viewCount.toLocaleString()} views
          </span>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="relative w-full aspect-[16/7] rounded-2xl overflow-hidden mb-8 bg-slate-100">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="tiptap-content prose prose-slate max-w-none prose-headings:text-[#0F1F3D] prose-headings:font-bold prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-blockquote:border-teal-500 prose-blockquote:bg-teal-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-1"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Back to blog */}
        <div className="mt-12 pt-8 border-t border-slate-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>
      </article>
    </>
  );
}
