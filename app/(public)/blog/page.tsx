import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { Eye, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Dental Billing Blog | Tips & Insights — DentalBillingCompany.us",
  description:
    "Expert tips, industry insights, and best practices for dental billing, revenue cycle management, and practice growth.",
  openGraph: {
    title: "Dental Billing Blog | Tips & Insights",
    description:
      "Expert tips and insights for dental billing professionals and practice owners.",
    type: "website",
  },
};

type BlogPostCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  viewCount: number;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string; slug: string } | null;
  authorId: string | null;
};

export default async function BlogIndexPage() {
  const posts: BlogPostCard[] = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: 12,
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      coverImage: true,
      viewCount: true,
      publishedAt: true,
      createdAt: true,
      category: { select: { name: true, slug: true } },
      authorId: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-bold text-3xl text-[#0F1F3D] mb-3">
          Dental Billing Blog
        </h1>
        <p className="text-slate-500 text-base max-w-2xl">
          Expert tips, industry insights, and best practices for dental billing,
          revenue cycle management, and practice growth.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-slate-400 text-lg">No posts published yet.</p>
          <p className="text-slate-400 text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function BlogCard({ post }: { post: BlogPostCard }) {
  const publishDate = post.publishedAt ?? post.createdAt;

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block bg-white rounded-2xl border border-slate-100 overflow-hidden hover:border-teal-200 hover:shadow-md transition-all duration-200"
    >
      {/* Cover image */}
      <div className="relative aspect-video bg-gradient-to-br from-[#0F1F3D] to-[#0F1F3D]/70 overflow-hidden">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/20 text-6xl font-bold">
              {post.title.charAt(0)}
            </span>
          </div>
        )}
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        {/* Category badge */}
        {post.category && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 text-xs font-semibold text-[#0F1F3D] backdrop-blur-sm">
              <Tag className="w-3 h-3" />
              {post.category.name}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h2 className="font-bold text-base text-[#0F1F3D] mb-2 leading-snug group-hover:text-teal-700 transition-colors line-clamp-2">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-sm text-slate-500 mb-4 leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-slate-400 mt-auto pt-3 border-t border-slate-50">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(publishDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            {post.viewCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
