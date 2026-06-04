import { Suspense } from "react"
import Link from "next/link"
import type { Metadata } from "next"
import { Search, SlidersHorizontal, X, MapPin, ArrowRight } from "lucide-react"
import { buildSearchMeta } from "@/lib/seo"
import { searchCompanies } from "@/lib/search"
import { CompanyCard } from "@/components/public/company/CompanyCard"
import { CompanyCardSkeleton } from "@/components/public/company/CompanyCardSkeleton"
import { prisma } from "@/lib/prisma"

interface SearchPageProps {
  searchParams: {
    q?: string
    city?: string
    state?: string
    zip?: string
    service?: string
    tier?: string
    minRating?: string
    page?: string
    sort?: string
  }
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  return buildSearchMeta(searchParams.q ?? "")
}

const SORT_OPTIONS = [
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviews" },
  { value: "newest", label: "Newest" },
  { value: "name", label: "Name A–Z" },
] as const

const TIER_OPTIONS = [
  { value: "", label: "All Tiers" },
  { value: "FEATURED", label: "Featured" },
  { value: "PREMIUM", label: "Premium" },
  { value: "BASIC", label: "Basic" },
  { value: "FREE", label: "Free" },
]

const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "4.5", label: "4.5+ Stars" },
  { value: "4", label: "4+ Stars" },
  { value: "3.5", label: "3.5+ Stars" },
  { value: "3", label: "3+ Stars" },
]

async function SearchResults({ searchParams }: SearchPageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10))
  const sort = (searchParams.sort as "rating" | "reviews" | "newest" | "name") ?? "rating"
  const minRating = searchParams.minRating ? parseFloat(searchParams.minRating) : undefined

  const { companies, total, totalPages } = await searchCompanies({
    q: searchParams.q,
    city: searchParams.city,
    state: searchParams.state,
    zip: searchParams.zip,
    service: searchParams.service,
    tier: searchParams.tier,
    minRating,
    page,
    perPage: 12,
    sort,
  })

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (searchParams.q) params.set("q", searchParams.q)
    if (searchParams.city) params.set("city", searchParams.city)
    if (searchParams.state) params.set("state", searchParams.state)
    if (searchParams.zip) params.set("zip", searchParams.zip)
    if (searchParams.service) params.set("service", searchParams.service)
    if (searchParams.tier) params.set("tier", searchParams.tier)
    if (searchParams.minRating) params.set("minRating", searchParams.minRating)
    if (searchParams.sort) params.set("sort", searchParams.sort)
    params.set("page", String(p))
    return `/search?${params.toString()}`
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="font-display font-bold text-2xl text-primary mb-2">No results found</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          {searchParams.q
            ? `We couldn't find any dental billing companies matching "${searchParams.q}". Try a broader search or browse by state.`
            : "No companies match your current filters. Try adjusting your search criteria."}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Clear all filters
          </a>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 hover:border-teal-500 transition-colors"
          >
            Browse all states
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="mt-10 text-left">
          <p className="text-sm font-semibold text-slate-600 mb-3">Suggestions:</p>
          <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
            <li>Check your spelling or try different keywords</li>
            <li>Remove location filters to search nationwide</li>
            <li>Try searching by service type (e.g. "insurance billing")</li>
            <li>Lower your minimum rating threshold</li>
          </ul>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-5">
        Showing <strong className="text-slate-800">{(page - 1) * 12 + 1}–{Math.min(page * 12, total)}</strong> of{" "}
        <strong className="text-slate-800">{total.toLocaleString()}</strong> companies
      </p>
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {companies.map((company) => (
          <CompanyCard key={company.id} company={company} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1">
          {page > 1 && (
            <a
              href={buildPageUrl(page - 1)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-colors"
            >
              Previous
            </a>
          )}
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            let p: number
            if (totalPages <= 7) {
              p = i + 1
            } else if (page <= 4) {
              p = i + 1
            } else if (page >= totalPages - 3) {
              p = totalPages - 6 + i
            } else {
              p = page - 3 + i
            }
            return (
              <a
                key={p}
                href={buildPageUrl(p)}
                aria-current={p === page ? "page" : undefined}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-primary text-white"
                    : "border border-slate-200 text-slate-700 hover:border-teal-500 hover:text-teal-600"
                }`}
              >
                {p}
              </a>
            )
          })}
          {page < totalPages && (
            <a
              href={buildPageUrl(page + 1)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-teal-500 hover:text-teal-600 transition-colors"
            >
              Next
            </a>
          )}
        </nav>
      )}
    </div>
  )
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const [states, services] = await Promise.all([
    prisma.state.findMany({ select: { name: true, abbreviation: true, slug: true }, orderBy: { name: "asc" } }),
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      select: { name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  const hasFilters = !!(
    searchParams.q ||
    searchParams.state ||
    searchParams.city ||
    searchParams.service ||
    searchParams.tier ||
    searchParams.minRating
  )

  const activeSort = searchParams.sort ?? "rating"

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="container">
          <h1 className="font-display font-bold text-3xl md:text-4xl mb-2">
            {searchParams.q ? `Results for "${searchParams.q}"` : "Find Dental Billing Companies"}
          </h1>
          <p className="text-primary-200 text-lg">
            Search and compare top dental billing specialists across the US
          </p>

          {/* Search bar */}
          <form method="GET" action="/search" className="mt-6 flex gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="q"
                defaultValue={searchParams.q ?? ""}
                placeholder="Search by name, service, or keyword..."
                className="w-full h-12 pl-11 pr-4 rounded-xl bg-white text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              {/* Preserve other params */}
              {searchParams.state && <input type="hidden" name="state" value={searchParams.state} />}
              {searchParams.service && <input type="hidden" name="service" value={searchParams.service} />}
              {searchParams.tier && <input type="hidden" name="tier" value={searchParams.tier} />}
              {searchParams.minRating && <input type="hidden" name="minRating" value={searchParams.minRating} />}
            </div>
            <button
              type="submit"
              className="h-12 px-6 rounded-xl bg-teal-500 text-white font-semibold text-sm hover:bg-teal-600 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="container py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-4">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </h2>
                {hasFilters && (
                  <a href="/search" className="text-xs text-teal-600 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" />
                    Clear
                  </a>
                )}
              </div>

              <form method="GET" action="/search" className="space-y-5">
                {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}

                {/* State */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    State
                  </label>
                  <select
                    name="state"
                    defaultValue={searchParams.state ?? ""}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                  >
                    <option value="">All States</option>
                    {states.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name} ({s.abbreviation})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Service Type
                  </label>
                  <select
                    name="service"
                    defaultValue={searchParams.service ?? ""}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                  >
                    <option value="">All Services</option>
                    {services.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Rating */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Minimum Rating
                  </label>
                  <select
                    name="minRating"
                    defaultValue={searchParams.minRating ?? ""}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
                  >
                    {RATING_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                    Listing Tier
                  </label>
                  <div className="space-y-1.5">
                    {TIER_OPTIONS.map((o) => (
                      <label key={o.value} className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="radio"
                          name="tier"
                          value={o.value}
                          defaultChecked={(searchParams.tier ?? "") === o.value}
                          className="accent-teal-500"
                        />
                        <span className="text-sm text-slate-700 group-hover:text-teal-600 transition-colors">
                          {o.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {hasFilters && (
                  <div className="flex flex-wrap gap-1.5">
                    {searchParams.state && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200">
                        <MapPin className="w-3 h-3" />
                        {states.find((s) => s.slug === searchParams.state)?.abbreviation ?? searchParams.state}
                        <a href={`/search?${new URLSearchParams({ ...searchParams, state: "" }).toString()}`} className="ml-0.5 hover:text-teal-900">
                          <X className="w-3 h-3" />
                        </a>
                      </span>
                    )}
                    {searchParams.service && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200">
                        {services.find((s) => s.slug === searchParams.service)?.name ?? searchParams.service}
                        <a href={`/search?${new URLSearchParams({ ...searchParams, service: "" }).toString()}`} className="ml-0.5 hover:text-teal-900">
                          <X className="w-3 h-3" />
                        </a>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Sort by:</span>
                <div className="flex gap-1">
                  {SORT_OPTIONS.map((o) => (
                    <a
                      key={o.value}
                      href={`/search?${new URLSearchParams({ ...searchParams, sort: o.value, page: "1" }).toString()}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        activeSort === o.value
                          ? "bg-primary text-white"
                          : "bg-white border border-slate-200 text-slate-700 hover:border-teal-500"
                      }`}
                    >
                      {o.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <CompanyCardSkeleton key={i} />
                  ))}
                </div>
              }
            >
              <SearchResults searchParams={searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
