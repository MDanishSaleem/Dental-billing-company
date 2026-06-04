import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, ArrowRight, Building2, TrendingUp, Users } from "lucide-react"

const BENEFITS = [
  "Free basic listing — no credit card required",
  "Get found by thousands of dental practices",
  "Receive direct quote requests and leads",
  "Upgrade to featured for maximum visibility",
]

export function OwnerCTABanner() {
  return (
    <section className="py-20 bg-primary relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-6 border border-white/20">
              <Building2 className="w-4 h-4 text-teal-400" />
              For Dental Billing Companies
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-4 leading-tight">
              Grow your dental billing business with a free listing
            </h2>
            <p className="text-white/70 text-lg mb-8 leading-relaxed">
              Join the largest US directory of dental billing and revenue cycle experts.
              Get discovered by dental practices actively searching for billing partners in your area.
            </p>

            <ul className="space-y-3 mb-8">
              {BENEFITS.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-white/80 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
                  {benefit}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="teal" size="lg">
                <Link href="/auth/register">
                  List your company free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline-white" size="lg">
                <Link href="/pricing">
                  View pricing plans
                </Link>
              </Button>
            </div>
          </div>

          {/* Right — stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Users, label: "Dental practices searching monthly", value: "10,000+", color: "text-teal-400" },
              { icon: TrendingUp, label: "Avg. leads per featured listing", value: "25+", color: "text-cyan-400" },
              { icon: Building2, label: "States with active practices", value: "50", color: "text-blue-400" },
              { icon: CheckCircle2, label: "Verified billing companies", value: "50+", color: "text-emerald-400" },
            ].map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="p-5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col gap-3"
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                  <div className={`font-display font-extrabold text-3xl stat-number ${stat.color}`}>
                    {stat.value}
                  </div>
                  <p className="text-white/60 text-xs leading-tight">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
