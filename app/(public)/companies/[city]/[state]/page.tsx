import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MapPin, ChevronRight, Building2, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { buildCityMeta } from "@/lib/seo"
import { buildBreadcrumbSchema } from "@/lib/structured-data"
import { CompanyCard } from "@/components/public/company/CompanyCard"

export const revalidate = 7200

interface CityPageProps {
  params: {
    city: string
    state: string
  }
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const stateRecord = await prisma.state.findUnique({
    where: { slug: params.state },
    select: { id: true, name: true, abbreviation: true },
  })
  if (!stateRecord) return {}

  const cityRecord = await prisma.city.findFirst({
    where: { slug: params.city, stateId: stateRecord.id },
    select: { name: true },
  })
  if (!cityRecord) return {}

  const count = await prisma.company.count({
    where: { status: "ACTIVE", city: { slug: params.city }, state: { slug: params.state } },
  })

  return buildCityMeta(cityRecord.name, stateRecord.name, stateRecord.abbreviation, count)
}

export async function generateStaticParams() {
  const cities = await prisma.city.findMany({
    where: {
      isActive: true,
      companies: { some: { status: "ACTIVE" } },
    },
    select: {
      slug: true,
      state: { select: { slug: true } },
    },
  })

  return cities.map((c) => ({
    city: c.slug,
    state: c.state.slug,
  }))
}

export default async function CityListingPage({ params }: CityPageProps) {
  const stateRecord = await prisma.state.findUnique({
    where: { slug: params.state },
    select: { id: true, name: true, abbreviation: true, slug: true },
  })

  if (!stateRecord) notFound()

  const cityRecord = await prisma.city.findFirst({
    where: { slug: params.city, stateId: stateRecord.id },
    select: { id: true, name: true, slug: true },
  })

  if (!cityRecord) notFound()

  const companies = await prisma.company.findMany({
    where: {
      status: "ACTIVE",
      cityId: cityRecord.id,
      stateId: stateRecord.id,
    },
    orderBy: [{ isFeatured: "desc" }, { ratingAverage: "desc" }],
    select: {
      id: true,
      slug: true,
      name: true,
      tagline: true,
      logo: true,
      coverImage: true,
      ratingAverage: true,
      reviewCount: true,
      tier: true,
      isFeatured: true,
      isVerified: true,
      phone: true,
      website: true,
      yearFounded: true,
      employeeCount: true,
      city: { select: { name: true, slug: true } },
      state: { select: { name: true, abbreviation: true, slug: true } },
      services: {
        take: 4,
        select: {
          category: { select: { name: true, slug: true, icon: true, color: true } },
        },
      },
    },
  })

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Directory", url: "/directory" },
    { name: stateRecord.name, url: `/directory/${stateRecord.slug}` },
    { name: cityRecord.name, url: `/companies/${cityRecord.slug}/${stateRecord.slug}` },
  ])

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary via-primary-700 to-primary-900 text-white py-14">
          <div className="container">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-teal-300 text-sm mb-5 flex-wrap">
              <Link href="/" className="hover:text-white transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/directory" className="hover:text-white transition-colors">
                Directory
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={`/directory/${stateRecord.slug}`} className="hover:text-white transition-colors">
                {stateRecord.name}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span>{cityRecord.name}</span>
            </nav>

            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                <MapPin className="w-7 h-7 text-teal-300" />
              </div>
              <div>
                <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
                  Dental Billing Companies in {cityRecord.name}, {stateRecord.abbreviation}
                </h1>
                <p className="text-primary-200 text-lg">
                  {companies.length > 0
                    ? `${companies.length} verified dental billing ${companies.length === 1 ? "company" : "companies"} serving ${cityRecord.name} practices`
                    : `Find dental billing specialists serving ${cityRecord.name}, ${stateRecord.name}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-50 min-h-screen">
          <div className="container py-10">
            {companies.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Building2 className="w-8 h-8 text-slate-400" />
                </div>
                <h2 className="font-display font-bold text-2xl text-primary mb-2">
                  No companies in {cityRecord.name} yet
                </h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  There are no dental billing companies listed in {cityRecord.name}, {stateRecord.abbreviation} yet.
                  Try browsing all companies in {stateRecord.name} or list your company.
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  <Link
                    href={`/directory/${stateRecord.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    All {stateRecord.name} Companies
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/search?state=${stateRecord.slug}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-teal-500 transition-colors"
                  >
                    Search in {stateRecord.abbreviation}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Showing all{" "}
                      <strong className="text-slate-800">{companies.length}</strong>{" "}
                      {companies.length === 1 ? "company" : "companies"} in{" "}
                      <strong className="text-slate-800">{cityRecord.name}, {stateRecord.abbreviation}</strong>
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Link
                      href={`/search?state=${stateRecord.slug}&city=${cityRecord.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-colors"
                    >
                      Filter & Sort
                    </Link>
                    <Link
                      href={`/directory/${stateRecord.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-colors"
                    >
                      All {stateRecord.abbreviation} Cities
                    </Link>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {companies.map((company) => (
                    <CompanyCard key={company.id} company={company} />
                  ))}
                </div>

                {/* Secondary CTA */}
                <div className="mt-12 bg-white rounded-2xl border border-slate-100 p-8 text-center">
                  <h3 className="font-display font-bold text-xl text-primary mb-2">
                    Looking for more options?
                  </h3>
                  <p className="text-muted-foreground text-sm mb-5">
                    Search all dental billing companies across {stateRecord.name} or the entire United States.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <Link
                      href={`/search?state=${stateRecord.slug}`}
                      className="px-5 py-2.5 rounded-xl bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
                    >
                      All Companies in {stateRecord.name}
                    </Link>
                    <Link
                      href="/search"
                      className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-teal-500 transition-colors"
                    >
                      Search Nationwide
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
