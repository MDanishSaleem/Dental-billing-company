import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Globe,
  Calendar,
  Users,
  CheckCircle2,
  Sparkles,
  Star,
  ChevronRight,
  ExternalLink,
  Mail,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { buildCompanyMeta } from "@/lib/seo";
import {
  buildLocalBusinessSchema,
  buildBreadcrumbSchema,
} from "@/lib/structured-data";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { cn, generateInitials, getInitialColor } from "@/lib/utils";
import { ContactForm } from "@/components/public/company/ContactForm";
import { CompanyTabs } from "@/components/public/company/CompanyTabs";
import { CompareButton } from "@/components/public/company/CompareButton";

export const revalidate = 3600;

// ─── Types ───────────────────────────────────────────────────────────────────

type PageProps = {
  params: { companySlug: string };
};

// ─── Static Params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const companies = await prisma.company.findMany({
    where: { status: "ACTIVE" },
    orderBy: { viewCount: "desc" },
    take: 1000,
    select: { slug: true },
  });
  return companies.map((c) => ({ companySlug: c.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const company = await prisma.company.findUnique({
    where: { slug: params.companySlug },
    include: {
      city: { select: { name: true } },
      state: { select: { name: true, abbreviation: true } },
    },
  });
  if (!company) return {};
  return buildCompanyMeta(company);
}

// ─── Tier Badge Helper ────────────────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  if (tier === "FEATURED")
    return (
      <Badge variant="gold_solid" className="gap-1">
        <Sparkles className="w-3 h-3" />
        Featured
      </Badge>
    );
  if (tier === "PREMIUM")
    return <Badge variant="teal">Premium</Badge>;
  if (tier === "BASIC")
    return <Badge variant="outline">Basic</Badge>;
  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CompanyProfilePage({ params }: PageProps) {
  const company = await prisma.company.findUnique({
    where: { slug: params.companySlug },
    include: {
      city: { select: { name: true, slug: true } },
      state: { select: { name: true, abbreviation: true, slug: true } },
      services: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
              color: true,
            },
          },
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 20,
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          reviewerName: true,
          createdAt: true,
          replyContent: true,
          repliedAt: true,
          isVerifiedPurchase: true,
        },
      },
      gallery: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, url: true, caption: true },
      },
    },
  });

  if (!company || company.status !== "ACTIVE") notFound();

  // Fire-and-forget view count increment
  prisma.company
    .update({
      where: { id: company.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => undefined);

  const location =
    company.city && company.state
      ? `${company.city.name}, ${company.state.abbreviation}`
      : company.state?.name ?? "";

  const initials = generateInitials(company.name);
  const bgColor = getInitialColor(company.name);

  const localBusinessSchema = buildLocalBusinessSchema(company);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Companies", url: "/companies" },
    ...(company.state
      ? [
          {
            name: company.state.name,
            url: `/directory/${company.state.slug}`,
          },
        ]
      : []),
    { name: company.name, url: `/companies/${company.slug}` },
  ]);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([localBusinessSchema, breadcrumbSchema]),
        }}
      />

      {/* ── Cover Image ─────────────────────────────────────────── */}
      <div className="relative w-full h-56 sm:h-72 lg:h-80 overflow-hidden">
        {company.coverImage ? (
          <Image
            src={company.coverImage}
            alt={`${company.name} cover`}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-700 to-teal-800" />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Breadcrumb overlay */}
        <div className="absolute top-4 left-0 right-0 px-4 sm:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-white/80">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/companies" className="hover:text-white transition-colors">
              Companies
            </Link>
            {company.state && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link
                  href={`/directory/${company.state.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {company.state.name}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-medium truncate max-w-[180px]">
              {company.name}
            </span>
          </nav>
        </div>
      </div>

      {/* ── Page Body ───────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Logo strip — overlaps the cover bottom */}
        <div className="flex items-end gap-5 -mt-12 mb-6">
          <div className="relative shrink-0">
            {company.logo ? (
              <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "w-24 h-24 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center text-white font-display font-bold text-3xl",
                  bgColor
                )}
              >
                {initials}
              </div>
            )}
            {company.isVerified && (
              <span className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1 border-2 border-white">
                <CheckCircle2 className="w-3 h-3 text-white" />
              </span>
            )}
          </div>

          <div className="pb-2 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display font-bold text-2xl sm:text-3xl text-primary leading-tight">
                {company.name}
              </h1>
              {company.isVerified && (
                <Badge variant="teal_light" className="shrink-0">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </Badge>
              )}
              <TierBadge tier={company.tier} />
            </div>
            {company.tagline && (
              <p className="text-slate-500 text-sm mt-1 leading-snug max-w-xl">
                {company.tagline}
              </p>
            )}
          </div>
        </div>

        {/* ── Two-column Layout ─────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── Main Content ──────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Rating row */}
            <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <StarRating rating={company.ratingAverage} size="lg" showValue />
              <span className="text-slate-500 text-sm">
                ({company.reviewCount}{" "}
                {company.reviewCount === 1 ? "review" : "reviews"})
              </span>
              {company.ratingAverage >= 4.5 && (
                <Badge variant="gold" className="ml-auto">
                  <Star className="w-3 h-3" />
                  Top Rated
                </Badge>
              )}
            </div>

            {/* Tabs: Overview | Services | Reviews | Gallery */}
            <CompanyTabs company={company} />
          </div>

          {/* ── Sticky Sidebar ──────────────────────────────────── */}
          <aside className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-24 space-y-5">
            {/* Contact form card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary-700 px-5 py-4">
                <h2 className="font-display font-bold text-white text-base">
                  Contact {company.name}
                </h2>
                <p className="text-white/70 text-xs mt-0.5">
                  Get a free quote · Usually responds within 1 business day
                </p>
              </div>
              <div className="p-5">
                <ContactForm
                  companyId={company.id}
                  companyName={company.name}
                />
              </div>
            </div>

            {/* Quick info card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
              <h3 className="font-display font-semibold text-primary text-sm uppercase tracking-wide">
                Quick Info
              </h3>

              {location && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-teal-500 mt-0.5 shrink-0" />
                  <span className="text-slate-700">{location}</span>
                </div>
              )}

              {company.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-teal-500 shrink-0" />
                  <a
                    href={`tel:${company.phone}`}
                    className="text-teal-600 hover:underline font-medium"
                  >
                    {company.phone}
                  </a>
                </div>
              )}

              {company.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-teal-500 shrink-0" />
                  <a
                    href={`mailto:${company.email}`}
                    className="text-teal-600 hover:underline truncate"
                  >
                    {company.email}
                  </a>
                </div>
              )}

              {company.website && (
                <div className="flex items-center gap-3 text-sm">
                  <Globe className="w-4 h-4 text-teal-500 shrink-0" />
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline truncate flex items-center gap-1"
                  >
                    Visit Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {company.yearFounded && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-teal-500 shrink-0" />
                  <span className="text-slate-700">
                    Founded {company.yearFounded}
                  </span>
                </div>
              )}

              {company.employeeCount && (
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-teal-500 shrink-0" />
                  <span className="text-slate-700">
                    {company.employeeCount} employees
                  </span>
                </div>
              )}

              {/* Divider + Compare */}
              <div className="border-t border-slate-100 pt-3">
                <CompareButton
                  company={{
                    id: company.id,
                    slug: company.slug,
                    name: company.name,
                    logo: company.logo ?? undefined,
                  }}
                />
              </div>
            </div>

            {/* Social links */}
            {(company.linkedIn || company.twitter || company.facebook) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-display font-semibold text-primary text-sm uppercase tracking-wide mb-3">
                  Social Media
                </h3>
                <div className="flex flex-wrap gap-3">
                  {company.linkedIn && (
                    <a
                      href={company.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-primary transition-colors text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  )}
                  {company.twitter && (
                    <a
                      href={company.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-primary transition-colors text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Twitter
                    </a>
                  )}
                  {company.facebook && (
                    <a
                      href={company.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-primary transition-colors text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Facebook
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
