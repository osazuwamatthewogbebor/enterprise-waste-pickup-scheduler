"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/src/components/logo";

type OrgStatus = "PENDING_VERIFICATION" | "VERIFIED" | "SUSPENDED";

interface NavLink {
  href: string;
  label: string;
}

const adminLinks: NavLink[] = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/admin/zones", label: "Zones" },
  { href: "/dashboard/admin/drivers", label: "Drivers" },
  { href: "/dashboard/admin/routes", label: "Routes" },
  { href: "/dashboard/admin/residents", label: "Residents" },
  { href: "/dashboard/admin/service-requests", label: "Service Requests" },
  { href: "/dashboard/admin/invoices", label: "Invoices" },
];

const driverLinks: NavLink[] = [{ href: "/dashboard/driver/routes", label: "My Routes" }];

const linkClass = "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";

function DashboardSidebar({
  links,
  pathname,
  user,
  onNavigate,
}: {
  links: NavLink[];
  pathname: string;
  user: { name: string | null; email: string | null };
  onNavigate: () => void;
}) {
  return (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-800/80 px-5">
        <Logo />
      </div>

      <nav className="space-y-2 p-4">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={
                active
                  ? `${linkClass} bg-white/10 text-white shadow-inner shadow-white/5`
                  : `${linkClass} text-slate-300 hover:bg-white/5 hover:text-white`
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800/80 bg-slate-950/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-sky-400 text-sm font-semibold text-white">
            {user.name?.charAt(0)?.toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {user.name ?? "Admin"}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {user.email ?? "admin@company.com"}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
            } finally {
              window.location.replace("/login");
            }
          }}
          className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </>
  );
}

export function DashboardShell({
  children,
  user,
  orgStatus,
  isSuperAdmin,
}: {
  children: React.ReactNode;
  user: {
    name: string | null;
    email: string | null;
    role: "ADMIN" | "DRIVER" | "RESIDENT";
    orgSlug: string;
  };
  orgStatus?: OrgStatus;
  isSuperAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user.role === "ADMIN";
  const isDriver = user.role === "DRIVER";
  let links = isAdmin ? adminLinks : isDriver ? driverLinks : [
    { href: `/${user.orgSlug}/portal/requests`, label: "My Requests" },
    { href: `/${user.orgSlug}/portal/new`, label: "New Request" },
    { href: `/${user.orgSlug}/portal/pickups`, label: "Upcoming Pickups" },
  ];
  if (isSuperAdmin) {
    links = [...links, { href: "/dashboard/admin/psps", label: "PSPs" }];
  }

  const locked = orgStatus && orgStatus !== "VERIFIED";

  return (
    <div className="flex min-h-screen bg-slate-100">
      <header className="fixed top-0 z-40 flex h-14 items-center justify-between gap-3 bg-white/90 px-4 shadow backdrop-blur md:hidden">
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="dashboard-mobile-menu"
          className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
        <span className="text-sm font-semibold text-slate-900">WastePickup</span>
        <div className="w-10" />
      </header>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-800/80 bg-slate-950 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.28)] md:flex md:flex-col">
        <DashboardSidebar
          links={links}
          pathname={pathname}
          user={user}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div
        id="dashboard-mobile-menu"
        aria-hidden={!mobileOpen}
        className={`fixed inset-0 z-50 flex md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
        <aside
          className={`relative z-50 flex w-72 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.28)] transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <DashboardSidebar
            links={links}
            pathname={pathname}
            user={user}
            onNavigate={() => setMobileOpen(false)}
          />
        </aside>
      </div>

      <main className="flex-1 pt-14 md:pt-0 md:pl-72">
        {isAdmin && locked && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <span className="font-medium">
              Your organization ({user.orgSlug}) is{" "}
              {orgStatus?.replace("_", " ").toLowerCase()}.
            </span>{" "}
            Live route dispatches, Paystack billing, and service request processing are locked pending
            verification by a platform administrator.
          </div>
        )}
        <div className="mx-auto max-w-7xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
