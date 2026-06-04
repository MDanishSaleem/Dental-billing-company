"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Briefcase, ArrowRight, CheckCircle2, TrendingUp, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const POPULAR_SEARCHES = [
  "Insurance billing", "AR recovery", "Credentialing",
  "Denial management", "Revenue cycle management",
]

const SERVICE_OPTIONS = [
  { label: "All Services", value: "" },
  { label: "Insurance Billing", value: "insurance-billing" },
  { label: "Revenue Cycle Management", value: "revenue-cycle-management" },
  { label: "AR Recovery", value: "ar-recovery" },
  { label: "Credentialing", value: "credentialing" },
  { label: "Denial Management", value: "denial-management" },
  { label: "Insurance Verification", value: "insurance-verification" },
  { label: "Dental Coding", value: "dental-coding" },
  { label: "Patient Billing", value: "patient-billing" },
]

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [location, setLocation] = useState("")
  const [service, setService] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (location) params.set("location", location)
    if (service) params.set("service", service)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <section className="relative min-h-[92vh] flex items-center hero-gradient overflow-hidden pt-16">
      {/* Decorative orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="container relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium mb-8">
            <CheckCircle2 className="w-4 h-4 text-teal-400" />
            50+ Verified Dental Billing Companies Listed
          </div>

          {/* Headline */}
          <h1 className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl text-white leading-[1.05] mb-6 text-balance">
            Find the Best{" "}
            <span className="relative inline-block">
              <span className="text-gradient bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Dental Billing
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-300 to-cyan-300 rounded-full" />
            </span>
            {" "}Company Near You
          </h1>

          <p className="text-white/75 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Browse vetted dental billing and revenue cycle management companies
            in every US state and major city. Compare reviews, services, and pricing — for free.
          </p>

          {/* Search card */}
          <form
            onSubmit={handleSearch}
            className="glass rounded-2xl p-2 max-w-3xl mx-auto shadow-2xl"
          >
            <div className="flex flex-col md:flex-row gap-2">
              {/* Company / keyword */}
              <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <Search className="w-5 h-5 text-white/60 shrink-0" />
                <input
                  type="text"
                  placeholder="Company name or service..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent text-white placeholder:text-white/50 text-sm outline-none w-full"
                />
              </div>

              {/* Location */}
              <div className="flex-1 flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                <MapPin className="w-5 h-5 text-white/60 shrink-0" />
                <input
                  type="text"
                  placeholder="City, state, or ZIP..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent text-white placeholder:text-white/50 text-sm outline-none w-full"
                />
              </div>

              {/* Service */}
              <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 min-w-[160px]">
                <Briefcase className="w-5 h-5 text-white/60 shrink-0" />
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="bg-transparent text-white/80 text-sm outline-none w-full cursor-pointer appearance-none"
                >
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-primary text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <Button type="submit" variant="teal" size="lg" className="shrink-0 px-8">
                Search
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Popular searches */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            <span className="text-white/50 text-xs">Popular:</span>
            {POPULAR_SEARCHES.map((term) => (
              <button
                key={term}
                onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white/70 text-xs transition-colors border border-white/10 hover:border-white/20"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 80L48 69.3C96 58.7 192 37.3 288 32C384 26.7 480 37.3 576 42.7C672 48 768 48 864 42.7C960 37.3 1056 26.7 1152 26.7C1248 26.7 1344 37.3 1392 42.7L1440 48V80H1392C1344 80 1248 80 1152 80C1056 80 960 80 864 80C768 80 672 80 576 80C480 80 384 80 288 80C192 80 96 80 48 80H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  )
}
