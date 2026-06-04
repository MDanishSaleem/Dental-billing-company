import Link from "next/link"
import Image from "next/image"
import { MapPin, Globe, Phone, Star, Users, CheckCircle2, Sparkles, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StarRating } from "@/components/ui/star-rating"
import { cn, generateInitials, getInitialColor, truncate } from "@/lib/utils"

type CompanyCardProps = {
  company: {
    id: string
    slug: string
    name: string
    tagline?: string | null
    logo?: string | null
    ratingAverage: number
    reviewCount: number
    tier: string
    isFeatured: boolean
    isVerified: boolean
    phone?: string | null
    website?: string | null
    yearFounded?: number | null
    employeeCount?: string | null
    city?: { name: string; slug: string } | null
    state?: { name: string; abbreviation: string; slug: string } | null
    services: { category: { name: string; slug: string; icon?: string | null; color?: string | null } }[]
  }
  className?: string
}

export function CompanyCard({ company, className }: CompanyCardProps) {
  const isFeatured = company.isFeatured || company.tier === "FEATURED"
  const isPremium = company.tier === "PREMIUM" || isFeatured
  const initials = generateInitials(company.name)
  const bgColor = getInitialColor(company.name)
  const location = company.city && company.state
    ? `${company.city.name}, ${company.state.abbreviation}`
    : company.state?.name ?? ""

  return (
    <div
      className={cn(
        "company-card group bg-white rounded-2xl border overflow-hidden flex flex-col",
        isFeatured
          ? "featured-card border-gold-300"
          : "border-slate-100 hover:border-teal-100",
        className
      )}
    >
      {/* Featured ribbon */}
      {isFeatured && (
        <div className="bg-gradient-to-r from-gold-400 to-gold-500 text-white text-xs font-bold px-4 py-1.5 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Featured Company
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          {/* Logo / Avatar */}
          <div className="shrink-0">
            {company.logo ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-100">
                <Image
                  src={company.logo}
                  alt={company.name}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg",
                bgColor
              )}>
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Link
                href={`/companies/${company.slug}`}
                className="font-display font-bold text-primary hover:text-teal-600 transition-colors truncate"
              >
                {company.name}
              </Link>
              {company.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" aria-label="Verified" />
              )}
            </div>

            {/* Location */}
            {location && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <MapPin className="w-3 h-3 shrink-0" />
                <span>{location}</span>
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              <StarRating rating={company.ratingAverage} size="sm" />
              <span className="text-xs font-semibold text-slate-700">
                {company.ratingAverage > 0 ? company.ratingAverage.toFixed(1) : "No reviews"}
              </span>
              {company.reviewCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({company.reviewCount})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tagline */}
        {company.tagline && (
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {truncate(company.tagline, 100)}
          </p>
        )}

        {/* Services */}
        {company.services.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {company.services.slice(0, 3).map((svc) => (
              <span
                key={svc.category.slug}
                className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-600 font-medium border border-slate-100"
              >
                {svc.category.name}
              </span>
            ))}
            {company.services.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-slate-50 text-slate-400">
                +{company.services.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4 mt-auto">
          {company.yearFounded && (
            <span>Est. {company.yearFounded}</span>
          )}
          {company.employeeCount && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {company.employeeCount}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-slate-50">
          <Button asChild variant="teal" size="sm" className="flex-1">
            <Link href={`/companies/${company.slug}`}>
              View Profile
              <ArrowRight className="w-3 h-3" />
            </Link>
          </Button>
          {company.phone && (
            <Button asChild variant="outline" size="sm">
              <a href={`tel:${company.phone}`}>
                <Phone className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
