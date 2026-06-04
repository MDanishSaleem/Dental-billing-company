import Link from "next/link"
import type { Metadata } from "next"
import { Check, Sparkles, Zap, Star, Crown } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { buildMeta } from "@/lib/seo"

export const revalidate = 3600

export const metadata: Metadata = buildMeta({
  title: "Pricing Plans — List Your Dental Billing Company | DentalBillingCompany.us",
  description:
    "Choose the right plan to list and promote your dental billing company. Free to start, with premium options for maximum visibility and lead generation.",
  canonical: "/pricing",
})

const TIER_ICONS: Record<string, React.ElementType> = {
  FREE: Zap,
  BASIC: Star,
  PREMIUM: Sparkles,
  FEATURED: Crown,
}

const TIER_GRADIENT: Record<string, string> = {
  FREE: "from-slate-50 to-white",
  BASIC: "from-teal-50/50 to-white",
  PREMIUM: "from-primary-50/80 to-white",
  FEATURED: "from-gold-50/80 to-white",
}

const TIER_BORDER: Record<string, string> = {
  FREE: "border-slate-200",
  BASIC: "border-teal-200",
  PREMIUM: "border-primary-300",
  FEATURED: "border-gold-300",
}

const TIER_BADGE: Record<string, string> = {
  FREE: "bg-slate-100 text-slate-600",
  BASIC: "bg-teal-100 text-teal-700",
  PREMIUM: "bg-primary/10 text-primary",
  FEATURED: "bg-gold-100 text-gold-700",
}

const TIER_CTA: Record<string, string> = {
  FREE: "bg-slate-800 hover:bg-slate-900 text-white",
  BASIC: "bg-teal-500 hover:bg-teal-600 text-white",
  PREMIUM: "bg-primary hover:bg-primary/90 text-white",
  FEATURED: "bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white",
}

const FALLBACK_PLANS = [
  {
    id: 1,
    name: "Free",
    slug: "free",
    tier: "FREE",
    price: "0",
    billingCycle: "monthly",
    features: ["Basic listing", "3 service categories", "1 gallery photo", "Contact form"],
    maxGalleryImages: 1,
    maxServices: 3,
    isPopular: false,
    sortOrder: 1,
  },
  {
    id: 2,
    name: "Basic",
    slug: "basic",
    tier: "BASIC",
    price: "29",
    billingCycle: "monthly",
    features: [
      "All Free features",
      "10 gallery photos",
      "All service categories",
      "Priority listing",
      "Analytics dashboard",
      "Email support",
    ],
    maxGalleryImages: 10,
    maxServices: 99,
    isPopular: false,
    sortOrder: 2,
  },
  {
    id: 3,
    name: "Premium",
    slug: "premium",
    tier: "PREMIUM",
    price: "79",
    billingCycle: "monthly",
    features: [
      "All Basic features",
      "Unlimited photos",
      "Verified badge",
      "Top of search results",
      "Response tracking",
      "Lead notifications",
      "Priority support",
    ],
    maxGalleryImages: 999,
    maxServices: 99,
    isPopular: true,
    sortOrder: 3,
  },
  {
    id: 4,
    name: "Featured",
    slug: "featured",
    tier: "FEATURED",
    price: "149",
    billingCycle: "monthly",
    features: [
      "All Premium features",
      "Homepage featured placement",
      "Gold border highlight",
      "Social media promotion",
      "Dedicated account manager",
      "Monthly performance report",
    ],
    maxGalleryImages: 999,
    maxServices: 99,
    isPopular: false,
    sortOrder: 4,
  },
]

type PlanData = {
  id: number
  name: string
  slug: string
  tier: string
  price: string
  billingCycle: string
  features: unknown
  maxGalleryImages: number
  maxServices: number
  isPopular: boolean
  sortOrder: number
}

function getFeaturesArray(features: unknown): string[] {
  if (Array.isArray(features)) return features as string[]
  if (typeof features === "string") {
    try {
      const parsed = JSON.parse(features)
      if (Array.isArray(parsed)) return parsed
    } catch {
      /* ignore */
    }
  }
  return []
}

export default async function PricingPage() {
  let plans: PlanData[] = []

  try {
    const dbPlans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        tier: true,
        price: true,
        billingCycle: true,
        features: true,
        maxGalleryImages: true,
        maxServices: true,
        isPopular: true,
        sortOrder: true,
      },
    })

    plans = dbPlans.map((p) => ({
      ...p,
      price: p.price.toString(),
    }))
  } catch {
    plans = FALLBACK_PLANS
  }

  if (plans.length === 0) {
    plans = FALLBACK_PLANS
  }

  const faqs = [
    {
      q: "Can I upgrade or downgrade my plan anytime?",
      a: "Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades apply at the end of your billing period.",
    },
    {
      q: "Is there a contract or commitment?",
      a: "No long-term contracts. All paid plans are month-to-month. You can cancel at any time from your dashboard.",
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards via Stripe, PayPal, and Payoneer for international clients.",
    },
    {
      q: "How quickly will my listing be live?",
      a: "Free and paid listings go live immediately after submission and review (usually within 24 hours).",
    },
    {
      q: "What does 'Top of search results' mean?",
      a: "Premium and Featured listings appear above Basic and Free listings in all search results and city/state pages.",
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary via-primary-800 to-primary-900 text-white pt-20 pb-32">
        <div className="container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-sm font-medium mb-5">
            <Sparkles className="w-4 h-4" />
            Simple, Transparent Pricing
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl mb-4 leading-tight">
            Grow Your Dental Billing Business
          </h1>
          <p className="text-primary-200 text-lg max-w-2xl mx-auto">
            From free basic listings to full-featured premium placements — get discovered by dental practices
            looking for billing partners right now.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="container -mt-20 pb-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {plans.map((plan) => {
            const Icon = TIER_ICONS[plan.tier] ?? Zap
            const features = getFeaturesArray(plan.features)
            const price = parseFloat(plan.price)
            const isFree = price === 0

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 bg-gradient-to-b shadow-sm overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1 ${
                  TIER_BORDER[plan.tier] ?? "border-slate-200"
                } ${TIER_GRADIENT[plan.tier] ?? "from-white to-white"} ${
                  plan.isPopular ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                {/* Most Popular badge */}
                {plan.isPopular && (
                  <div className="absolute -top-px left-0 right-0 bg-primary text-white text-xs font-bold text-center py-1.5 flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </div>
                )}

                <div className={`p-6 flex-1 flex flex-col ${plan.isPopular ? "pt-9" : ""}`}>
                  {/* Tier icon & label */}
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        TIER_BADGE[plan.tier] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-xs font-bold uppercase tracking-wider ${
                        plan.tier === "FREE"
                          ? "text-slate-500"
                          : plan.tier === "BASIC"
                          ? "text-teal-600"
                          : plan.tier === "PREMIUM"
                          ? "text-primary"
                          : "text-gold-600"
                      }`}
                    >
                      {plan.name}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-5">
                    <div className="flex items-end gap-1">
                      <span className="font-display font-bold text-4xl text-primary">
                        {isFree ? "Free" : `$${price}`}
                      </span>
                      {!isFree && (
                        <span className="text-muted-foreground text-sm mb-1.5">
                          /{plan.billingCycle === "monthly" ? "mo" : "yr"}
                        </span>
                      )}
                    </div>
                    {isFree ? (
                      <p className="text-sm text-muted-foreground">Forever free</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Billed monthly, cancel anytime</p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2.5 flex-1 mb-6">
                    {features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check
                          className={`w-4 h-4 mt-0.5 shrink-0 ${
                            plan.tier === "FREE"
                              ? "text-slate-500"
                              : plan.tier === "BASIC"
                              ? "text-teal-500"
                              : plan.tier === "PREMIUM"
                              ? "text-primary"
                              : "text-gold-500"
                          }`}
                        />
                        <span className="text-sm text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Limits callout */}
                  <div className="bg-white/60 rounded-xl border border-slate-100 px-3 py-2 mb-5 text-xs text-muted-foreground">
                    <span className="font-semibold text-slate-700">
                      {plan.maxServices === 99 ? "All" : plan.maxServices} services
                    </span>{" "}
                    ·{" "}
                    <span className="font-semibold text-slate-700">
                      {plan.maxGalleryImages === 999 ? "Unlimited" : plan.maxGalleryImages} photo{plan.maxGalleryImages !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* CTA */}
                  <Link
                    href="/auth/register"
                    className={`block w-full h-11 rounded-xl text-sm font-bold text-center flex items-center justify-center transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98] ${
                      TIER_CTA[plan.tier] ?? "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {isFree ? "Get Started Free" : `Start ${plan.name} Plan`}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-teal-500" />
            No contracts
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-teal-500" />
            Cancel anytime
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-teal-500" />
            Stripe-secured payments
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-teal-500" />
            Instant activation
          </span>
        </div>
      </div>

      {/* Feature comparison */}
      <div className="bg-slate-50 border-t border-slate-100 py-16">
        <div className="container">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-primary text-center mb-3">
            What&apos;s included in each plan
          </h2>
          <p className="text-muted-foreground text-center mb-10 max-w-xl mx-auto">
            Every listing gets discovered by dental practices searching for billing partners. Higher tiers get premium placement.
          </p>

          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-4 font-display font-bold text-primary">Feature</th>
                    {plans.map((p) => (
                      <th key={p.id} className="px-4 py-4 text-center">
                        <span className={`text-sm font-bold ${
                          p.tier === "FEATURED" ? "text-gold-600" : p.tier === "PREMIUM" ? "text-primary" : "text-slate-700"
                        }`}>
                          {p.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    ["Company Listing", true, true, true, true],
                    ["Contact Form", true, true, true, true],
                    ["Service Categories", "3", "All", "All", "All"],
                    ["Gallery Photos", "1", "10", "Unlimited", "Unlimited"],
                    ["Priority Placement", false, true, true, true],
                    ["Verified Badge", false, false, true, true],
                    ["Analytics Dashboard", false, true, true, true],
                    ["Lead Notifications", false, false, true, true],
                    ["Homepage Featured", false, false, false, true],
                    ["Account Manager", false, false, false, true],
                  ].map(([feature, ...values]) => (
                    <tr key={String(feature)} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-3.5 text-sm font-medium text-slate-700">{feature as string}</td>
                      {values.map((val, i) => (
                        <td key={i} className="px-4 py-3.5 text-center">
                          {typeof val === "boolean" ? (
                            val ? (
                              <Check className="w-4 h-4 text-teal-500 mx-auto" />
                            ) : (
                              <span className="text-slate-200 text-lg leading-none">—</span>
                            )
                          ) : (
                            <span className="text-sm font-semibold text-slate-800">{String(val)}</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="container py-16">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-primary text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto grid gap-4">
          {faqs.map((faq) => (
            <div key={faq.q} className="bg-white rounded-2xl border border-slate-100 p-6">
              <h3 className="font-display font-bold text-slate-800 mb-2">{faq.q}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-br from-primary to-primary-800 text-white py-16">
        <div className="container text-center">
          <h2 className="font-display font-bold text-3xl md:text-4xl mb-4">
            Ready to grow your client base?
          </h2>
          <p className="text-primary-200 text-lg max-w-xl mx-auto mb-8">
            Join hundreds of dental billing companies getting discovered by practices across the US.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-3.5 rounded-xl bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors shadow-lg shadow-teal-900/20"
            >
              Create Free Listing
            </Link>
            <Link
              href="/directory"
              className="px-8 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-bold hover:bg-white/20 transition-colors"
            >
              Browse Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
