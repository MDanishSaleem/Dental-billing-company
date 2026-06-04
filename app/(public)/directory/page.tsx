import Link from "next/link"
import type { Metadata } from "next"
import { MapPin, ChevronRight, Building2 } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { buildMeta } from "@/lib/seo"

export const revalidate = 86400

export const metadata: Metadata = buildMeta({
  title: "Dental Billing Companies by State | Browse All 50 States",
  description:
    "Find dental billing and revenue cycle management companies in your state. Browse our directory of verified billing specialists across all 50 US states.",
  canonical: "/directory",
})

export default async function DirectoryPage() {
  const states = await prisma.state.findMany({
    where: { isActive: true },
    select: {
      name: true,
      abbreviation: true,
      slug: true,
      _count: {
        select: {
          companies: {
            where: { status: "ACTIVE" },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  })

  const totalCompanies = states.reduce((sum, s) => sum + s._count.companies, 0)
  const statesWithCompanies = states.filter((s) => s._count.companies > 0).length

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary-700 to-primary-900 text-white py-16">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-sm font-medium mb-5">
            <MapPin className="w-4 h-4" />
            National Directory
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4">
            Dental Billing Companies by State
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto mb-8">
            Browse verified dental billing and revenue cycle management specialists in every US state.
            Find the perfect partner for your dental practice.
          </p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-teal-400">
                {totalCompanies.toLocaleString()}
              </div>
              <div className="text-primary-300 text-sm">Total Companies</div>
            </div>
            <div className="w-px h-10 bg-white/20 hidden sm:block" />
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-teal-400">{statesWithCompanies}</div>
              <div className="text-primary-300 text-sm">States Covered</div>
            </div>
            <div className="w-px h-10 bg-white/20 hidden sm:block" />
            <div className="text-center">
              <div className="font-display font-bold text-3xl text-teal-400">50</div>
              <div className="text-primary-300 text-sm">States Listed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="container py-3">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-teal-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-medium">Directory</span>
          </nav>
        </div>
      </div>

      {/* State Grid */}
      <div className="container py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display font-bold text-2xl text-primary mb-1">Browse All States</h2>
            <p className="text-muted-foreground text-sm">
              Click any state to see companies and cities with active listings
            </p>
          </div>
          <Link
            href="/search"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-semibold hover:bg-teal-600 transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Search All Companies
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {states.map((state) => {
            const count = state._count.companies
            const hasCompanies = count > 0

            return (
              <Link
                key={state.slug}
                href={hasCompanies ? `/directory/${state.slug}` : "#"}
                aria-disabled={!hasCompanies}
                className={`group flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${
                  hasCompanies
                    ? "bg-white border-slate-100 hover:border-teal-300 hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                    : "bg-slate-50/50 border-slate-100 cursor-default opacity-60"
                }`}
              >
                {/* Abbreviation badge */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0 transition-colors ${
                    hasCompanies
                      ? "bg-primary/5 text-primary group-hover:bg-teal-50 group-hover:text-teal-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {state.abbreviation}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold text-sm truncate transition-colors ${
                      hasCompanies ? "text-slate-800 group-hover:text-teal-700" : "text-slate-400"
                    }`}
                  >
                    {state.name}
                  </div>
                  <div className={`text-xs mt-0.5 ${hasCompanies ? "text-teal-600 font-medium" : "text-slate-400"}`}>
                    {count === 0 ? "No listings yet" : `${count} ${count === 1 ? "company" : "companies"}`}
                  </div>
                </div>

                {hasCompanies && (
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors shrink-0" />
                )}
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary to-primary-700 text-white p-8 md:p-12 text-center">
          <h2 className="font-display font-bold text-2xl md:text-3xl mb-3">
            Can&apos;t find your state?
          </h2>
          <p className="text-primary-200 mb-6 max-w-lg mx-auto">
            New companies are added daily. Use our search to find billing companies near you or list your company to reach thousands of dental practices.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/search"
              className="px-6 py-3 rounded-xl bg-teal-500 text-white font-semibold hover:bg-teal-600 transition-colors"
            >
              Search All Companies
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-colors"
            >
              List Your Company
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
