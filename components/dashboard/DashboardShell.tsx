"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  Inbox,
  Star,
  CreditCard,
  ChevronRight,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type NavItem = {
  label: string;
  href: string;
  icon: React.ElementType;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Profile", href: "/dashboard/profile", icon: Building2 },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Leads", href: "/dashboard/leads", icon: Inbox },
  { label: "Reviews", href: "/dashboard/reviews", icon: Star },
  { label: "Subscription", href: "/dashboard/subscription", icon: CreditCard },
];

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
    item.href === "/dashboard"
      ? pathname === item.href
      : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
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

function SidebarContent({
  user,
  pathname,
  onNavigate,
}: {
  user: { name: string; email: string; image?: string };
  pathname: string;
  onNavigate?: () => void;
}) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-slate-100">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-[#0F1F3D] flex items-center justify-center">
            <span className="text-white text-xs font-bold">DB</span>
          </div>
          <div>
            <span className="font-bold text-[#0F1F3D] text-sm leading-tight block">
              DentalBilling
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
              Owner Portal
            </span>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-5 py-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9">
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback className="text-xs bg-teal-100 text-teal-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">
              {user.name}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Menu
        </p>
        {NAV_ITEMS.map((item) => (
          <NavItemRow
            key={item.href}
            item={item}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-100 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-50"
        >
          <ChevronRight className="w-3 h-3" />
          View public site
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

type DashboardShellProps = {
  children: React.ReactNode;
  session: {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  };
};

export function DashboardShell({ children, session }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const user = {
    name: session.user?.name ?? "User",
    email: session.user?.email ?? "",
    image: session.user?.image ?? undefined,
  };

  const pageTitle = (() => {
    const item = NAV_ITEMS.find((n) =>
      n.href === "/dashboard" ? pathname === n.href : pathname.startsWith(n.href)
    );
    return item?.label ?? "Dashboard";
  })();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 shrink-0 flex-col bg-white border-r border-slate-100">
        <SidebarContent user={user} pathname={pathname} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
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
          user={user}
          pathname={pathname}
          onNavigate={() => setSidebarOpen(false)}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 shrink-0 bg-white border-b border-slate-100 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-base font-semibold text-[#0F1F3D]">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/profile"
              className="p-2 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
              title="Edit profile"
            >
              <User className="w-4 h-4" />
            </Link>
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
