"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/src/components/logo";

interface ResidentPortalShellProps {
  slug: string;
  user: { name: string | null; email: string | null };
  children: React.ReactNode;
}

const linkClass =
  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors";

const residentLinks = [
  { href: "requests", label: "My Requests", icon: "M9 12h6m2 0v6m0 0H9m9 0V8a3 3 0 00-3-3H8a3 3 0 00-3 3v10a3 3 0 003 3h6" },
  { href: "new", label: "New Request", icon: "M12 4.5v15m7.5-7.5H4.5" },
  { href: "pickups", label: "Upcoming Pickups", icon: "M3 7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" },
  { href: "payments", label: "Payments", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2z" },
];

function SidebarNav({
  slug,
  user,
  onNavigate,
}: {
  slug: string;
  user: { name: string | null; email: string | null };
  onNavigate: () => void;
}) {
  const pathname = usePathname();

  const segments = pathname.split("/");
  const currentTab = segments[segments.length - 1] || "requests";

  return (
    <>
      <div className="flex h-20 items-center gap-3 border-b border-slate-800/80 px-5">
        <Logo compact />
      </div>

      <nav className="space-y-2 p-4">
        {residentLinks.map((link) => {
          const active = currentTab === link.href;
          return (
            <Link
              key={link.href}
              href={`/${slug}/portal/${link.href}`}
              onClick={onNavigate}
              className={
                active
                  ? `${linkClass} bg-white/10 text-white shadow-inner shadow-white/5`
                  : `${linkClass} text-slate-300 hover:bg-white/5 hover:text-white`
              }
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={link.icon} />
              </svg>
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-800/80 bg-slate-950/80 p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-sky-400 text-sm font-semibold text-white">
            {user.name?.charAt(0)?.toUpperCase() ?? "R"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white">
              {user.name || "Resident"}
            </p>
            <p className="truncate text-[11px] text-slate-400">
              {user.email || "Verified Resident"}
            </p>
          </div>
        </div>
        <button
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
            } finally {
              window.location.replace(`/${slug}/portal/login`);
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

export function ResidentPortalShell({ slug, user, children }: ResidentPortalShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-800/80 bg-slate-950 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.28)] lg:flex lg:flex-col">
        <SidebarNav slug={slug} user={user} onNavigate={() => setMobileOpen(false)} />
      </aside>

      <div
        className={`fixed inset-0 z-50 flex lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
        <aside
          className={`relative z-50 flex w-72 flex-col border-r border-slate-800/80 bg-slate-950 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.28)] transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarNav slug={slug} user={user} onNavigate={() => setMobileOpen(false)} />
        </aside>
      </div>

      <main className="flex-1 lg:pl-72">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 shadow backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            aria-controls="resident-mobile-menu"
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {!mobileOpen ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
                focusable="false"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
                focusable="false"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
              </svg>
            )}
          </button>
          <span className="text-sm font-semibold text-slate-900">WastePickup Portal</span>
          <div className="w-10" />
        </header>

        <div className="mx-auto max-w-7xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
