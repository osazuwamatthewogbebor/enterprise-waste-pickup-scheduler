"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const adminLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/admin/zones", label: "Zones" },
  { href: "/dashboard/admin/drivers", label: "Drivers" },
  { href: "/dashboard/admin/routes", label: "Routes" },
  { href: "/dashboard/admin/residents", label: "Residents" },
  { href: "/dashboard/admin/service-requests", label: "Service Requests" },
  { href: "/dashboard/admin/invoices", label: "Invoices" },
];

const driverLinks = [
  { href: "/dashboard/driver/routes", label: "My Routes" },
];

const residentLinks = [
  { href: "/dashboard/resident", label: "My Account" },
];

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: {
    name: string | null;
    email: string | null;
    role: "ADMIN" | "DRIVER" | "RESIDENT";
    orgSlug: string;
  };
}) {
  const pathname = usePathname();
  const isAdmin = (user as any).role === "ADMIN";
  const isDriver = (user as any).role === "DRIVER";
  const links = isAdmin ? adminLinks : isDriver ? driverLinks : residentLinks;

  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-10 w-72 border-r border-slate-800/80 bg-slate-950 text-slate-100 shadow-[0_20px_60px_rgba(15,23,42,0.28)]">
        <div className="flex h-20 items-center gap-3 border-b border-slate-800/80 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-slate-300 uppercase">WastePickup</p>
            <p className="text-[10px] text-slate-400">Operations Suite</p>
          </div>
        </div>

        <nav className="space-y-2 p-4">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-xl px-3 py-2.5 text-sm font-medium ${
                  active
                    ? "bg-white/10 text-white shadow-inner shadow-white/5"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
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
              <p className="truncate text-xs font-semibold text-white">{user.name ?? "Admin"}</p>
              <p className="truncate text-[11px] text-slate-400">{user.email ?? "admin@company.com"}</p>
            </div>
          </div>
          <button
            onClick={() => {
              document.cookie = "auth-token=; path=/; max-age=0";
              router.push("/login");
            }}
            className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 hover:border-slate-500 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 pl-72">
        <div className="mx-auto max-w-7xl p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
