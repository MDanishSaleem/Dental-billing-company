import { Suspense } from "react"
import type { Metadata } from "next"
import { HeroSection } from "@/components/public/home/HeroSection"
import { StatsBar } from "@/components/public/home/StatsBar"
import { CategoryGrid } from "@/components/public/home/CategoryGrid"
import { FeaturedCompanies } from "@/components/public/home/FeaturedCompanies"
import { BrowseByState } from "@/components/public/home/BrowseByState"
import { HowItWorks } from "@/components/public/home/HowItWorks"
import { OwnerCTABanner } from "@/components/public/home/OwnerCTABanner"
import { CompanyCardSkeleton } from "@/components/public/company/CompanyCardSkeleton"
import { buildWebsiteSchema } from "@/lib/structured-data"
import { defaultMeta } from "@/lib/seo"

export const metadata: Metadata = defaultMeta
export const revalidate = 1800

export default function HomePage() {
  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildWebsiteSchema()) }}
      />

      <HeroSection />
      <StatsBar />
      <CategoryGrid />

      <Suspense
        fallback={
          <section className="py-20 bg-white">
            <div className="container grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <CompanyCardSkeleton key={i} />)}
            </div>
          </section>
        }
      >
        <FeaturedCompanies />
      </Suspense>

      <HowItWorks />

      <Suspense fallback={<div className="py-20 bg-slate-50" />}>
        <BrowseByState />
      </Suspense>

      <OwnerCTABanner />
    </>
  )
}
