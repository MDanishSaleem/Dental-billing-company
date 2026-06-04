import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dentalbillingcompany.us";
const SITE_NAME = "DentalBillingCompany.us";

export function buildMeta(opts: {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = opts.canonical ? `${SITE_URL}${opts.canonical}` : SITE_URL;
  return {
    title: opts.title,
    description: opts.description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: SITE_NAME,
      images: opts.image ? [{ url: opts.image, width: 1200, height: 630 }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
      images: opts.image ? [opts.image] : [],
    },
    robots: opts.noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function buildCompanyMeta(company: {
  name: string;
  tagline?: string | null;
  description?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  slug: string;
  coverImage?: string | null;
  city?: { name: string } | null;
  state?: { abbreviation: string } | null;
}): Metadata {
  const location =
    company.city && company.state
      ? ` in ${company.city.name}, ${company.state.abbreviation}`
      : "";
  const title =
    company.metaTitle ?? `${company.name} | Dental Billing Services${location}`;
  const description =
    company.metaDescription ??
    company.tagline ??
    (company.description ? company.description.slice(0, 155) : `Dental billing services by ${company.name}${location}.`);

  return buildMeta({
    title,
    description,
    canonical: `/companies/${company.slug}`,
    image: company.coverImage ?? undefined,
  });
}

export function buildCityMeta(city: string, state: string, stateAbbr: string, count: number): Metadata {
  return buildMeta({
    title: `Dental Billing Companies in ${city}, ${stateAbbr} (${count} Listed)`,
    description: `Find and compare ${count} dental billing companies in ${city}, ${state}. Read reviews, compare services, and request free quotes from top billing specialists.`,
    canonical: `/companies/${city.toLowerCase().replace(/\s+/g, "-")}/${state.toLowerCase().replace(/\s+/g, "-")}`,
  });
}

export function buildStateMeta(state: string, stateAbbr: string, count: number): Metadata {
  return buildMeta({
    title: `Dental Billing Companies in ${state} — Find & Compare (${count} Listed)`,
    description: `Browse ${count} dental billing and revenue cycle management companies in ${state}. Compare ratings, services, and pricing to find the best fit for your dental practice.`,
    canonical: `/directory/${state.toLowerCase().replace(/\s+/g, "-")}`,
  });
}

export function buildSearchMeta(query: string): Metadata {
  return buildMeta({
    title: `Search Results${query ? ` for "${query}"` : ""} | Dental Billing Companies`,
    description: `Search results for dental billing companies${query ? ` matching "${query}"` : ""} across the United States.`,
    noIndex: true,
  });
}

export const defaultMeta: Metadata = buildMeta({
  title: `${SITE_NAME} — Find the Best Dental Billing Company Near You`,
  description:
    "Browse, compare, and contact dental billing and revenue cycle management companies across all 50 US states. Find verified specialists for your dental practice.",
  canonical: "/",
});
