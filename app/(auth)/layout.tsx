import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Account | DentalBillingCompany.us",
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-800 to-primary-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white font-display font-bold text-xl hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
              DB
            </div>
            <span>DentalBilling<span className="text-teal-400">.us</span></span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/20 border border-white/10 overflow-hidden">
          {children}
        </div>

        {/* Footer links */}
        <p className="mt-6 text-center text-xs text-primary-300">
          <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
          {" · "}
          <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          {" · "}
          <Link href="/" className="hover:text-white transition-colors">Back to Home</Link>
        </p>
      </div>
    </div>
  )
}
