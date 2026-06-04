import { Search, BarChart2, MessageSquare, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const STEPS = [
  {
    step: "01",
    icon: Search,
    title: "Search & Filter",
    description: "Search by city, state, ZIP code, or specialty. Use filters to narrow down by service type, rating, and tier.",
    color: "text-teal-500",
    bg: "bg-teal-50",
    border: "border-teal-100",
  },
  {
    step: "02",
    icon: BarChart2,
    title: "Compare Companies",
    description: "Add up to 4 companies to our comparison tool. See ratings, services, pricing, and trust scores side by side.",
    color: "text-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    step: "03",
    icon: MessageSquare,
    title: "Contact & Get Quotes",
    description: "Send a direct quote request to your chosen company. Get a response within 24 hours — completely free.",
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-white">
      <div className="container">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1.5 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold mb-4">
            How It Works
          </div>
          <h2 className="font-display font-bold text-3xl md:text-4xl text-primary mb-4">
            Find your billing partner in 3 simple steps
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            No middlemen, no contracts required. Browse, compare, and connect directly with dental billing specialists.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-14 left-[calc(16.67%+2rem)] right-[calc(16.67%+2rem)] h-px bg-gradient-to-r from-teal-200 via-blue-200 to-emerald-200" />

          {STEPS.map((step, idx) => {
            const Icon = step.icon
            return (
              <div key={step.step} className="flex flex-col items-center text-center group">
                {/* Step indicator */}
                <div className={`relative w-28 h-28 rounded-2xl ${step.bg} ${step.border} border-2 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className={`w-10 h-10 ${step.color}`} />
                  <div className={`absolute -top-3 -right-3 w-7 h-7 rounded-full bg-white border-2 ${step.border} flex items-center justify-center text-xs font-bold ${step.color}`}>
                    {idx + 1}
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl text-primary mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="teal" size="lg">
            <Link href="/search">
              Start Searching
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
