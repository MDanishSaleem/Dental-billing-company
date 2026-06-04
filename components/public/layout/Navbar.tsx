"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown, Search, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Browse", href: "/directory" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const isHome = pathname === "/"

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navBg = isHome
    ? isScrolled
      ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100"
      : "bg-transparent"
    : "bg-white border-b border-slate-100"

  const textColor = isHome && !isScrolled ? "text-white" : "text-slate-700"
  const logoColor = isHome && !isScrolled ? "text-white" : "text-primary"
  const logoAccent = isHome && !isScrolled ? "text-teal-300" : "text-teal-500"

  return (
    <header className={cn("fixed top-0 inset-x-0 z-50 transition-all duration-300", navBg)}>
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-lg">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold",
            isHome && !isScrolled ? "bg-teal-400" : "bg-primary"
          )}>
            DB
          </div>
          <span className={cn("hidden sm:inline", logoColor)}>
            DentalBilling<span className={logoAccent}>.us</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10",
                textColor,
                pathname === link.href && (isHome && !isScrolled ? "bg-white/20" : "bg-slate-100 text-primary")
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className={cn("text-sm font-medium transition-colors hover:opacity-80", textColor)}
          >
            Sign in
          </Link>
          <Button asChild variant={isHome && !isScrolled ? "outline-white" : "default"} size="sm">
            <Link href="/auth/register">
              <Building2 className="w-4 h-4" />
              List your company
            </Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn("md:hidden p-2 rounded-lg", textColor)}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/auth/login"
                className="px-4 py-3 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
              <Button asChild className="mx-4">
                <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                  <Building2 className="w-4 h-4" />
                  List your company
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
