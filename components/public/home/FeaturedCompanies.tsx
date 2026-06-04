import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { CompanyCard } from "@/components/public/company/CompanyCard"

async function getFeaturedCompanies() {
  return prisma.company.findMany({
    where: { status: "ACTIVE", OR: [{ isFeatured: true }, { tier: "FEATURED" }, { tier: "PREMIUM" }] },
    orderBy: [{ isFeatured: "desc" }, { ratingAverage: "desc" }],
    take: 6,
    select: {
      id: true, slug: true, name: true, tagline: true, logo: true,
      ratingAverage: true, reviewCount: true, tier: true,
      isFeatured: true, isVerified: true, phone: true, website: true,
      yearFounded: true, employeeCount: true,
      city: { select: { name: true, slug: true } },
      state: { select: { name: true, abbreviation: true, slug: true } },
      services: { take: 4, select: { category: { select: { name: true, slug: true, icon: true, color: true } } } },
    },
  })
}

export async function FeaturedCompanies() {
  const companies = await getFeaturedCompanies()

  if (companies.length === 0) return null

  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="inline-block px-4 py-1.5 rounded-full bg-gold-50 text-gold-700 text-sm font-semibold border border-gold-200 mb-3">
              ★ Featured Partners
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-primary">
              Top Dental Billing Companies
            </h2>
            <p className="text-muted-foreground mt-2">Verified companies with highest client satisfaction</p>
          </div>
          <Link
            href="/search"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            View all companies
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
          >
            View all companies <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
