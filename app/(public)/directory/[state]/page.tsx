import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { MapPin, ChevronRight, Building2, ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { buildStateMeta } from "@/lib/seo"

export const revalidate = 86400

interface StatePageProps {
  params: { state: string }
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const stateRecord = await prisma.state.findUnique({
    where: { slug: params.state },
    select: { name: true, abbreviation: true, _count: { select: { companies: { where: { status: "ACTIVE" } } } } },
  })
  if (!stateRecord) return {}
  return buildStateMeta(stateRecord.name, stateRecord.abbreviation, stateRecord._count.companies)
}

export async function generateStaticParams() {
  const states = await prisma.state.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
  return states.map((s) => ({ state: s.slug }))
}

export default async function StateDirectoryPage({ params }: StatePageProps) {
  const stateRecord = await prisma.state.findUnique({
    where: { slug: params.state },
    select: {
      id: true,
      name: true,
      abbreviation: true,
      slug: true,
    },
  })

  if (!stateRecord) notFound()

  // Get cities in this state that have active companies, with counts
  const cities = await prisma.city.findMany({
    where: {
      stateId: stateRecord.id,
      isActive: true,
      companies: {
        some: { status: "ACTIVE" },
      },
    },
    select: {
      name: true,
      slug: true,
      population: true,
      _count: {
        select: {
          companies: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
    orderBy: [{ population: "desc" }, { name: "asc" }],
  })

  const totalCompanies = cities.reduce((sum, c) => sum + c._count.companies, 0)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary-700 to-primary-900 text-white py-14">
        <div className="container">
          <div className="flex items-center gap-2 text-teal-300 text-sm mb-4 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/directory" className="hover:text-white transition-colors">
              Directory
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span>{stateRecord.name}</span>
          </div>

          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-display font-bold text-xl shrink-0">
              {stateRecord.abbreviation}
            </div>
            <div>
              <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
                Dental Billing Companies in {stateRecord.name}
              </h1>
              <p className="text-primary-200 text-lg">
                {totalCompanies > 0
                  ? `${totalCompanies} verified dental billing ${totalCompanies === 1 ? "company" : "companies"} across ${cities.length} ${cities.length === 1 ? "city" : "cities"}`
                  : "Be the first dental billing company listed in this state"}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link
              href={`/search?state=${stateRecord.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              View All {stateRecord.abbreviation} Companies
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-10">
        {cities.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="font-display font-bold text-2xl text-primary mb-2">No companies listed yet</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              There are no dental billing companies listed in {stateRecord.name} yet. Be the first to get your practice
              discovered!
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link
                href="/auth/register"
                className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                List Your Company Free
              </Link>
              <Link
                href="/directory"
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:border-teal-500 transition-colors"
              >
                Browse Other States
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display font-bold text-2xl text-primary mb-1">
                  Cities in {stateRecord.name}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {cities.length} {cities.length === 1 ? "city" : "cities"} with active dental billing listings
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  href={`/companies/${city.slug}/${stateRecord.slug}`}
                  className="group bg-white rounded-2xl border border-slate-100 p-5 hover:border-teal-300 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 group-hover:bg-teal-50 transition-colors flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-primary group-hover:text-teal-600 transition-colors" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors mt-1" />
                  </div>

                  <h3 className="font-display font-bold text-slate-800 group-hover:text-teal-700 transition-colors mb-1">
                    {city.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">
                    {stateRecord.name}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                      <Building2 className="w-3 h-3" />
                      {city._count.companies} {city._count.companies === 1 ? "company" : "companies"}
                    </span>
                    {city.population && (
                      <span className="text-xs text-muted-foreground">
                        Pop. {city.population.toLocaleString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* State-wide search CTA */}
            <div className="mt-12 rounded-2xl bg-slate-100 border border-slate-200 p-8 flex flex-col sm:flex-row items-center gap-6 justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-primary mb-1">
                  Don&apos;t see your city?
                </h3>
                <p className="text-muted-foreground text-sm">
                  Search all companies in {stateRecord.name} to find billing specialists near you.
                </p>
              </div>
              <Link
                href={`/search?state=${stateRecord.slug}`}
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Search All in {stateRecord.abbreviation}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
