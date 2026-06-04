const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dentalbillingcompany.us";

export function buildLocalBusinessSchema(company: {
  name: string;
  slug: string;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  city?: { name: string } | null;
  state?: { name: string; abbreviation: string } | null;
  zipCode?: string | null;
  ratingAverage: number;
  reviewCount: number;
  logo?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    description: company.description,
    url: `${SITE_URL}/companies/${company.slug}`,
    telephone: company.phone,
    email: company.email,
    sameAs: company.website ? [company.website] : [],
    image: company.logo,
    address: company.address
      ? {
          "@type": "PostalAddress",
          streetAddress: company.address,
          addressLocality: company.city?.name,
          addressRegion: company.state?.abbreviation,
          postalCode: company.zipCode,
          addressCountry: "US",
        }
      : undefined,
    geo:
      company.latitude && company.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: company.latitude,
            longitude: company.longitude,
          }
        : undefined,
    aggregateRating:
      company.reviewCount > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: company.ratingAverage.toFixed(1),
            reviewCount: company.reviewCount,
            bestRating: "5",
            worstRating: "1",
          }
        : undefined,
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function buildWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DentalBillingCompany.us",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function buildBlogPostSchema(post: {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
  authorId?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    publisher: {
      "@type": "Organization",
      name: "DentalBillingCompany.us",
      url: SITE_URL,
    },
  };
}
