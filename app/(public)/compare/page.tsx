import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckCircle2, Globe, Phone, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Dental Billing Companies | DentalBillingCompany.us",
  description:
    "Compare dental billing companies side by side. Evaluate ratings, services, pricing tiers, and more to find the right fit for your practice.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const TIER_LABEL: Record<string, string> = {
  FREE: "Free",
  BASIC: "Basic",
  PREMIUM: "Premium",
  FEATURED: "Featured",
};

const TIER_VARIANT: Record<string, "muted" | "teal" | "default" | "gold_solid"> = {
  FREE: "muted",
  BASIC: "teal",
  PREMIUM: "default",
  FEATURED: "gold_solid",
};

type CompanyRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  ratingAverage: number;
  reviewCount: number;
  tier: string;
  isFeatured: boolean;
  isVerified: boolean;
  yearFounded: number | null;
  employeeCount: string | null;
  phone: string | null;
  website: string | null;
  city: { name: string } | null;
  state: { name: string; abbreviation: string } | null;
  services: { category: { name: string; slug: string } }[];
};

function AttributeRow({
  label,
  values,
}: {
  label: string;
  values: React.ReactNode[];
}) {
  return (
    <tr className="border-b border-slate-100 even:bg-slate-50/50">
      <td className="py-3.5 px-5 text-sm font-semibold text-slate-600 whitespace-nowrap w-36 bg-white border-r border-slate-100">
        {label}
      </td>
      {values.map((val, i) => (
        <td
          key={i}
          className="py-3.5 px-5 text-sm text-slate-700 align-top"
        >
          {val}
        </td>
      ))}
      {/* Fill empty columns if fewer than 3 companies */}
      {Array.from({ length: Math.max(0, 3 - values.length) }).map((_, i) => (
        <td key={`empty-${i}`} className="py-3.5 px-5" />
      ))}
    </tr>
  );
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const rawIds = searchParams.ids ?? "";
  const slugs = rawIds
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (slugs.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Star className="w-8 h-8 text-slate-300" />
        </div>
        <h1 className="font-bold text-2xl text-[#0F1F3D] mb-2">
          No companies selected
        </h1>
        <p className="text-slate-500 text-sm mb-6 max-w-sm">
          Add companies to compare from the directory. You can compare up to 3
          companies at a time.
        </p>
        <Link
          href="/directory"
          className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-600 transition-colors"
        >
          Browse Directory
        </Link>
      </div>
    );
  }

  const companies: CompanyRow[] = await prisma.company
    .findMany({
      where: { slug: { in: slugs } },
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        ratingAverage: true,
        reviewCount: true,
        tier: true,
        isFeatured: true,
        isVerified: true,
        yearFounded: true,
        employeeCount: true,
        phone: true,
        website: true,
        city: { select: { name: true } },
        state: { select: { name: true, abbreviation: true } },
        services: {
          select: {
            category: { select: { name: true, slug: true } },
          },
        },
      },
    })
    .then((rows) =>
      // Preserve slug order from query params
      slugs
        .map((slug) => rows.find((r) => r.slug === slug))
        .filter((r): r is CompanyRow => Boolean(r))
    );

  if (companies.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-bold text-2xl text-[#0F1F3D] mb-2">
          Companies not found
        </h1>
        <p className="text-slate-500 text-sm mb-6">
          The requested companies could not be found.
        </p>
        <Link
          href="/directory"
          className="inline-flex items-center justify-center h-10 px-5 rounded-lg bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-600 transition-colors"
        >
          Back to Directory
        </Link>
      </div>
    );
  }

  const colWidth = `${Math.floor(100 / (companies.length + 1))}%`;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold text-2xl text-[#0F1F3D]">
            Compare Companies
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Side-by-side comparison of {companies.length} dental billing{" "}
            {companies.length === 1 ? "company" : "companies"}.
          </p>
        </div>
        <Link
          href="/directory"
          className="inline-flex items-center justify-center h-9 px-4 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:border-teal-500 hover:text-teal-600 transition-colors"
        >
          Clear & Browse
        </Link>
      </div>

      {/* Comparison table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <colgroup>
              <col style={{ width: "140px" }} />
              {companies.map((_, i) => (
                <col key={i} style={{ width: colWidth }} />
              ))}
              {Array.from({ length: 3 - companies.length }).map((_, i) => (
                <col key={`empty-col-${i}`} style={{ width: colWidth }} />
              ))}
            </colgroup>

            {/* Company name headers */}
            <thead>
              <tr className="bg-[#0F1F3D]">
                <th className="py-4 px-5 text-left text-xs font-semibold text-white/60 uppercase tracking-wide">
                  Attribute
                </th>
                {companies.map((company) => (
                  <th
                    key={company.id}
                    className="py-4 px-5 text-left"
                  >
                    <Link
                      href={`/companies/${company.slug}`}
                      className="font-bold text-white hover:text-cyan-300 transition-colors block"
                    >
                      {company.name}
                    </Link>
                    {company.isVerified && (
                      <span className="flex items-center gap-1 text-cyan-400 text-xs mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </th>
                ))}
                {Array.from({ length: 3 - companies.length }).map((_, i) => (
                  <th key={`empty-th-${i}`} className="py-4 px-5" />
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Rating */}
              <AttributeRow
                label="Rating"
                values={companies.map((c) => (
                  <div key={c.id} className="flex items-center gap-2">
                    <span className="text-amber-400">
                      {"★".repeat(Math.round(c.ratingAverage))}
                      {"☆".repeat(5 - Math.round(c.ratingAverage))}
                    </span>
                    <span className="font-semibold">
                      {c.ratingAverage > 0
                        ? c.ratingAverage.toFixed(1)
                        : "—"}
                    </span>
                  </div>
                ))}
              />

              {/* Reviews */}
              <AttributeRow
                label="Reviews"
                values={companies.map((c) => (
                  <span key={c.id}>
                    {c.reviewCount > 0
                      ? `${c.reviewCount} review${c.reviewCount !== 1 ? "s" : ""}`
                      : "No reviews"}
                  </span>
                ))}
              />

              {/* Tier */}
              <AttributeRow
                label="Plan Tier"
                values={companies.map((c) => (
                  <Badge
                    key={c.id}
                    variant={TIER_VARIANT[c.tier] ?? "muted"}
                    className="text-[11px]"
                  >
                    {TIER_LABEL[c.tier] ?? c.tier}
                  </Badge>
                ))}
              />

              {/* Year Founded */}
              <AttributeRow
                label="Est."
                values={companies.map((c) => (
                  <span key={c.id}>{c.yearFounded ?? "—"}</span>
                ))}
              />

              {/* Employees */}
              <AttributeRow
                label="Employees"
                values={companies.map((c) => (
                  <span key={c.id}>{c.employeeCount ?? "—"}</span>
                ))}
              />

              {/* Location */}
              <AttributeRow
                label="Location"
                values={companies.map((c) => (
                  <span key={c.id}>
                    {c.city && c.state
                      ? `${c.city.name}, ${c.state.abbreviation}`
                      : c.state?.name ?? "—"}
                  </span>
                ))}
              />

              {/* Services */}
              <AttributeRow
                label="Services"
                values={companies.map((c) => (
                  <span key={c.id} className="text-slate-600 leading-relaxed">
                    {c.services.length > 0
                      ? c.services.map((s) => s.category.name).join(", ")
                      : "—"}
                  </span>
                ))}
              />

              {/* Phone */}
              <AttributeRow
                label="Phone"
                values={companies.map((c) =>
                  c.phone ? (
                    <a
                      key={c.id}
                      href={`tel:${c.phone}`}
                      className="flex items-center gap-1.5 text-teal-600 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {c.phone}
                    </a>
                  ) : (
                    <span key={c.id} className="text-slate-400">
                      —
                    </span>
                  )
                )}
              />

              {/* Website */}
              <AttributeRow
                label="Website"
                values={companies.map((c) =>
                  c.website ? (
                    <a
                      key={c.id}
                      href={c.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-teal-600 hover:underline truncate"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">
                        {c.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </span>
                    </a>
                  ) : (
                    <span key={c.id} className="text-slate-400">
                      —
                    </span>
                  )
                )}
              />

              {/* View Profile links */}
              <tr className="bg-slate-50/50">
                <td className="py-4 px-5 bg-white border-r border-slate-100" />
                {companies.map((c) => (
                  <td key={c.id} className="py-4 px-5">
                    <Link
                      href={`/companies/${c.slug}`}
                      className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-600 transition-colors"
                    >
                      View Profile
                    </Link>
                  </td>
                ))}
                {Array.from({ length: 3 - companies.length }).map((_, i) => (
                  <td key={`empty-action-${i}`} className="py-4 px-5" />
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
