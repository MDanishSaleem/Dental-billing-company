import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXTAUTH_URL ?? "https://dentalbillingcompany.us";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/directory`,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "daily",
      priority: 0.6,
    },
  ];

  // Active companies (max 10,000)
  const companies = await prisma.company.findMany({
    where: { status: "ACTIVE" },
    select: { slug: true, updatedAt: true },
    take: 10000,
    orderBy: { updatedAt: "desc" },
  });

  const companyPages: MetadataRoute.Sitemap = companies.map((c) => ({
    url: `${baseUrl}/companies/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
    lastModified: c.updatedAt,
  }));

  // States
  const states = await prisma.state.findMany({
    where: { isActive: true },
    select: { slug: true },
  });

  const statePages: MetadataRoute.Sitemap = states.map((s) => ({
    url: `${baseUrl}/directory/${s.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Cities that have at least one active company
  const citiesWithCompanies = await prisma.city.findMany({
    where: {
      isActive: true,
      companies: { some: { status: "ACTIVE" } },
    },
    select: {
      slug: true,
      state: { select: { slug: true } },
    },
  });

  const cityPages: MetadataRoute.Sitemap = citiesWithCompanies.map((c) => ({
    url: `${baseUrl}/directory/${c.state.slug}/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Published blog posts
  const blogPosts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.5,
    lastModified: p.updatedAt,
  }));

  return [
    ...staticPages,
    ...companyPages,
    ...statePages,
    ...cityPages,
    ...blogPages,
  ];
}
