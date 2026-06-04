"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Upload,
  ShieldCheck,
  Star,
  Inbox,
  FileText,
  File,
  Image,
  CreditCard,
  Receipt,
  Tag,
  Map,
  SearchCode,
  Palette,
  Settings,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Nav config ──────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Listings",
    items: [
      { label: "Companies", href: "/admin/companies", icon: Building2 },
      { label: "Add Company", href: "/admin/companies/new", icon: PlusCircle },
      { label: "Import CSV", href: "/admin/companies/import", icon: Upload },
      { label: "Owner Claims", href: "/admin/claims", icon: ShieldCheck },
    ],
  },
  {
    title: "Community",
    items: [
      { label: "Reviews", href: "/admin/reviews", icon: Star },
      { label: "Leads", href: "/admin/leads", icon: Inbox },
    ],
  },
  {
    title: "Content",
    items: [
      { label: "Blog Posts", href: "/admin/blog", icon: FileText },
      { label: "Pages", href: "/admin/pages", icon: File },
    ],
  },
  {
    title: "Media",
    items: [
      { label: "Media Library", href: "/admin/media", icon: Image },
    ],
  },
  {
    title: "Monetization",
    items: [
      { label: "Plans & Pricing", href: "/admin/plans", icon: CreditCard },
      { label: "Transactions", href: "/admin/payments", icon: Receipt },
    ],
  },
  {
    title: "Directory",
    items: [
      { label: "Categories", href: "/admin/categories", icon: Tag },
      { label: "States & Cities", href: "/admin/states", icon: Map },
    ],
  },
  {
    title: "Config",
    items: [
      { label: "SEO Settings", href: "/admin/seo", icon: SearchCode },
      { label: "Appearance", href: "/admin/appearance", icon: Palette },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

// ─── Sidebar Nav Item ─────────────────────────────────────────────────────────

function NavItemRow({
  item,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}) {
  const active =
    item.href === "/admin/dashboard"
      ? pathname === item.href
      : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
        active
          ? "bg-teal-50 text-teal-700 border-l-2 border-teal-500 pl-[10px]"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-2 border-transparent"
      )}
    >
      <Icon
        className={cn(
          "w-4 h-4 shrink-0",
          active ? "text-teal-600" : "text-slate-400"
        )}
      />
      {item.label}
    </Link>
  );
}

// ─── Sidebar Content ──────────────────────────────────────────────────────────

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-100">
        <Link
          href="/admin/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">DB</span>
          </div>
          <div>
            <span className="font-display font-bold text-primary text-sm leading-tight block">
              DentalBilling
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
              Admin Panel
            </span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <NavItemRow
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-100">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-700 transition-colors"
        >
          <ChevronRight className="w-3 h-3" />
          View public site
        </Link>
      </div>
    </div>
  );
}

// ─── Breadcrumbs ─────────────────────────────────────────────────────────────

function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname
    .replace("/admin", "")
    .split("/")
    .filter(Boolean);

  const crumbs = [
    { label: "Admin", href: "/admin/dashboard" },
    ...parts.map((part, i) => ({
      label:
        part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " "),
      href: "/admin/" + parts.slice(0, i + 1).join("/"),
    })),
  ];

  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-400">
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
          {i < crumbs.length - 1 ? (
            <Link
              href={crumb.href}
              className="hover:text-slate-700 transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-slate-700 font-semibold">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ─── AdminShell ───────────────────────────────────────────────────────────────

type AdminShellProps = {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    image?: string;
  };
};

export function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-slate-100">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* ── Mobile Sidebar Overlay ──────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Mobile Sidebar Drawer ───────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent
          pathname={pathname}
          onNavigate={() => setSidebarOpen(false)}
        />
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Breadcrumbs pathname={pathname} />
          </div>

          <div className="flex items-center gap-2">
            {/* Bell placeholder */}
            <button
              type="button"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User menu */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <Avatar className="w-8 h-8">
                {user.image && <AvatarImage src={user.image} alt={user.name} />}
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 leading-tight truncate max-w-[120px]">
                  {user.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors ml-1"
                aria-label="Log out"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
