import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { buildMeta } from "@/lib/seo";
import { buildBreadcrumbSchema } from "@/lib/structured-data";
import type { Metadata } from "next";

export const revalidate = 86400;

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
    select: {
      title: true,
      metaTitle: true,
      metaDescription: true,
      slug: true,
    },
  });

  if (!page) {
    return buildMeta({
      title: "Page Not Found | DentalBillingCompany.us",
      description: "The requested page could not be found.",
    });
  }

  return buildMeta({
    title:
      page.metaTitle ??
      `${page.title} | DentalBillingCompany.us`,
    description:
      page.metaDescription ??
      `${page.title} — DentalBillingCompany.us`,
    canonical: `/${page.slug}`,
  });
}

export default async function CmsPage({ params }: { params: Params }) {
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      content: true,
      status: true,
    },
  });

  if (!page || page.status !== "PUBLISHED") {
    notFound();
  }

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: page.title, url: `/${page.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-bold text-3xl sm:text-4xl text-[#0F1F3D] mb-8">
          {page.title}
        </h1>

        <div
          className="tiptap-content prose prose-slate max-w-none prose-headings:text-[#0F1F3D] prose-headings:font-bold prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-blockquote:border-teal-500"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </>
  );
}
