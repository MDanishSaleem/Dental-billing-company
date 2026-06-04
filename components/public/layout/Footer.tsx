import Link from "next/link"
import { MapPin, Phone, Mail, Globe, Share2, Users } from "lucide-react"

const US_STATES = [
  { name: "Alabama", slug: "alabama" }, { name: "Alaska", slug: "alaska" },
  { name: "Arizona", slug: "arizona" }, { name: "Arkansas", slug: "arkansas" },
  { name: "California", slug: "california" }, { name: "Colorado", slug: "colorado" },
  { name: "Connecticut", slug: "connecticut" }, { name: "Florida", slug: "florida" },
  { name: "Georgia", slug: "georgia" }, { name: "Illinois", slug: "illinois" },
  { name: "Indiana", slug: "indiana" }, { name: "Iowa", slug: "iowa" },
  { name: "Kansas", slug: "kansas" }, { name: "Kentucky", slug: "kentucky" },
  { name: "Louisiana", slug: "louisiana" }, { name: "Maryland", slug: "maryland" },
  { name: "Massachusetts", slug: "massachusetts" }, { name: "Michigan", slug: "michigan" },
  { name: "Minnesota", slug: "minnesota" }, { name: "Missouri", slug: "missouri" },
  { name: "Nevada", slug: "nevada" }, { name: "New Jersey", slug: "new-jersey" },
  { name: "New York", slug: "new-york" }, { name: "North Carolina", slug: "north-carolina" },
  { name: "Ohio", slug: "ohio" }, { name: "Oklahoma", slug: "oklahoma" },
  { name: "Oregon", slug: "oregon" }, { name: "Pennsylvania", slug: "pennsylvania" },
  { name: "Tennessee", slug: "tennessee" }, { name: "Texas", slug: "texas" },
  { name: "Utah", slug: "utah" }, { name: "Virginia", slug: "virginia" },
  { name: "Washington", slug: "washington" }, { name: "Wisconsin", slug: "wisconsin" },
]

const TOP_CITIES = [
  { name: "New York, NY", citySlug: "new-york", stateSlug: "new-york" },
  { name: "Houston, TX", citySlug: "houston", stateSlug: "texas" },
  { name: "Los Angeles, CA", citySlug: "los-angeles", stateSlug: "california" },
  { name: "Chicago, IL", citySlug: "chicago", stateSlug: "illinois" },
  { name: "Dallas, TX", citySlug: "dallas", stateSlug: "texas" },
  { name: "Miami, FL", citySlug: "miami", stateSlug: "florida" },
  { name: "Phoenix, AZ", citySlug: "phoenix", stateSlug: "arizona" },
  { name: "Atlanta, GA", citySlug: "atlanta", stateSlug: "georgia" },
  { name: "Boston, MA", citySlug: "boston", stateSlug: "massachusetts" },
  { name: "Seattle, WA", citySlug: "seattle", stateSlug: "washington" },
]

export function Footer() {
  return (
    <footer className="bg-primary text-white">
      {/* Main footer */}
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
                DB
              </div>
              <span className="font-display font-bold text-lg">
                DentalBilling<span className="text-teal-400">.us</span>
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-5">
              The trusted US directory of dental billing and revenue cycle management companies.
            </p>
            <div className="flex gap-3">
              {[Globe, Share2, Users].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-teal-500 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Browse Companies", href: "/directory" },
                { label: "Search", href: "/search" },
                { label: "Compare Tools", href: "/compare" },
                { label: "Pricing", href: "/pricing" },
                { label: "Blog", href: "/blog" },
                { label: "List Your Company", href: "/auth/register" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-teal-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Cities */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
              Top Cities
            </h3>
            <ul className="space-y-2">
              {TOP_CITIES.map((city) => (
                <li key={city.citySlug}>
                  <Link
                    href={`/companies/${city.citySlug}/${city.stateSlug}`}
                    className="text-sm text-white/70 hover:text-teal-400 transition-colors"
                  >
                    {city.name} dental billing
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white/50 mb-4">
              Services
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Insurance Billing", slug: "insurance-billing" },
                { label: "Revenue Cycle Mgmt", slug: "revenue-cycle-management" },
                { label: "AR Recovery", slug: "ar-recovery" },
                { label: "Credentialing", slug: "credentialing" },
                { label: "Denial Management", slug: "denial-management" },
                { label: "Insurance Verification", slug: "insurance-verification" },
                { label: "Dental Coding", slug: "dental-coding" },
                { label: "Patient Billing", slug: "patient-billing" },
              ].map((svc) => (
                <li key={svc.slug}>
                  <Link
                    href={`/search?service=${svc.slug}`}
                    className="text-sm text-white/70 hover:text-teal-400 transition-colors"
                  >
                    {svc.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* States SEO grid */}
        <div className="border-t border-white/10 pt-10">
          <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-white/40 mb-5">
            Dental Billing by State
          </h3>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {US_STATES.map((state) => (
              <Link
                key={state.slug}
                href={`/directory/${state.slug}`}
                className="text-xs text-white/50 hover:text-teal-400 transition-colors whitespace-nowrap"
              >
                {state.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} DentalBillingCompany.us. All rights reserved.
          </p>
          <div className="flex gap-5">
            {[
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Sitemap", href: "/sitemap.xml" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
