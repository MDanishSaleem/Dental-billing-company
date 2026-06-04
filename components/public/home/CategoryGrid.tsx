import Link from "next/link"
import { Shield, TrendingUp, CheckCircle, FileText, DollarSign, Award, AlertCircle, Users, Code, Building2, CreditCard, BookOpen } from "lucide-react"

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Shield, TrendingUp, CheckCircle, FileText, DollarSign, Award,
  AlertCircle, Users, Code, Building2, CreditCard, BookOpen,
}

const CATEGORIES = [
  { name: "Insurance Billing", slug: "insurance-billing", icon: "Shield", color: "#06B6D4", bg: "#E0F9FF" },
  { name: "Revenue Cycle", slug: "revenue-cycle-management", icon: "TrendingUp", color: "#10B981", bg: "#D1FAE5" },
  { name: "Insurance Verification", slug: "insurance-verification", icon: "CheckCircle", color: "#3B82F6", bg: "#DBEAFE" },
  { name: "Claims Processing", slug: "claims-processing", icon: "FileText", color: "#8B5CF6", bg: "#EDE9FE" },
  { name: "AR Recovery", slug: "ar-recovery", icon: "DollarSign", color: "#F59E0B", bg: "#FEF3C7" },
  { name: "Credentialing", slug: "credentialing", icon: "Award", color: "#EF4444", bg: "#FEE2E2" },
  { name: "Denial Management", slug: "denial-management", icon: "AlertCircle", color: "#EC4899", bg: "#FCE7F3" },
  { name: "Patient Billing", slug: "patient-billing", icon: "Users", color: "#14B8A6", bg: "#CCFBF1" },
  { name: "Dental Coding", slug: "dental-coding", icon: "Code", color: "#6366F1", bg: "#E0E7FF" },
  { name: "Practice Management", slug: "practice-management", icon: "Building2", color: "#0F172A", bg: "#F1F5F9" },
  { name: "Payment Posting", slug: "payment-posting", icon: "CreditCard", color: "#059669", bg: "#D1FAE5" },
  { name: "Accounting", slug: "accounting-bookkeeping", icon: "BookOpen", color: "#7C3AED", bg: "#EDE9FE" },
]

export function CategoryGrid() {
  return (
    <section className="py-16 bg-slate-50/50">
      <div className="container">
        <div className="text-center mb-10">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-primary mb-2">
            Browse by Specialty
          </h2>
          <p className="text-muted-foreground">Find companies specializing in exactly what your practice needs</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] ?? Shield
            return (
              <Link
                key={cat.slug}
                href={`/search?service=${cat.slug}`}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl bg-white border border-slate-100 hover:border-teal-200 hover:shadow-md transition-all duration-200 text-center"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200"
                  style={{ backgroundColor: cat.bg }}
                >
                  <Icon className="w-6 h-6" style={{ color: cat.color }} />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-teal-700 leading-tight">
                  {cat.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
