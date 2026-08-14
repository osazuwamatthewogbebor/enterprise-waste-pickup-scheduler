import Link from "next/link";
import { HeaderAuth, SignInDropdown } from "@/src/components/header-auth";

const metrics = [
  { value: "186%", label: "Faster route planning" },
  { value: "24/7", label: "Operational visibility" },
  { value: "99.2%", label: "Billing accuracy" },
];

const featureCards = [
  {
    title: "Route orchestration",
    description:
      "Build optimized pickup plans, balance driver workloads, and dispatch work from a single operating view.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 18V6l10-2v12M9 18l-4 2V6l4-2m0 14 10-2" />
      </svg>
    ),
  },
  {
    title: "Resident intelligence",
    description:
      "Track resident history, automate billing, and surface service issues before they impact collection performance.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 10v-2a4 4 0 0 0-3-3.87M20 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Driver accountability",
    description:
      "Give field teams real-time assignments, proof of service capture, and simple reporting from any device.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
  },
  {
    title: "Payments & invoices",
    description:
      "Automate recurring billing, accelerate collections, and keep every resident interaction visible in one ledger.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h3m5 0h3M6 6h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />
      </svg>
    ),
  },
  {
    title: "Service requests",
    description:
      "Create frictionless public request flows that turn resident issues into organized operational tasks.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10v10H7zM10 10h4m-4 4h4M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      </svg>
    ),
  },
  {
    title: "Operational control",
    description:
      "Monitor live route status, confirm pickups, and react instantly to service gaps across every zone.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l3-7 4 14 3-7h4" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <span className="block text-base font-semibold tracking-[-0.03em] text-slate-900">WastePickup</span>
              <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">Operations platform</span>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="/about" className="hover:text-slate-900">About</Link>
            <Link href="/features" className="hover:text-slate-900">Features</Link>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/careers" className="hover:text-slate-900">Careers</Link>
            <Link href="/contact" className="hover:text-slate-900">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-slate-900">Privacy</Link>
          </nav>

          <div className="flex items-center gap-3">
            <HeaderAuth />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-130 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.18),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.12),transparent_30%)]" />
          <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
            <div className="lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-14">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">
                  Enterprise waste operations
                </div>
                <h1 className="mt-6 text-5xl font-bold tracking-tighter text-slate-950 sm:text-6xl">
                  Modern operations for cleaner, smarter collections.
                </h1>
                <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">
                  Run route planning, payments, resident service requests, and field execution from one modern platform built for Nigerian waste businesses.
                </p>

                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <Link
                    href="/request"
                    className="rounded-full bg-emerald-600 px-7 py-3.5 text-center text-base font-semibold text-white shadow-lg shadow-emerald-600/25 hover:-translate-y-0.5 hover:bg-emerald-500"
                  >
                    Submit a service request
                  </Link>
                  <SignInDropdown variant="outline" align="left" size={"w-40"} />
                </div>

                <p className="mt-4 max-w-lg text-sm leading-6 text-slate-500">
                  Residents and property managers can report missed pickups or
                  schedule a stop without an account. Drivers and company admins
                  sign in with their assigned phone number or email.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> No setup fees</span>
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Cancel anytime</span>
                </div>
              </div>

              <div className="relative mt-12 lg:mt-0">
                <div className="absolute -inset-4 rounded-4xl bg-linear-to-br from-blue-100 via-indigo-100 to-slate-100 blur-2xl" />
                <div className="relative rounded-4xl border border-slate-200 bg-white p-3 shadow-[0_30px_80px_rgba(15,23,42,0.12)] motion-safe:animate-float">
                  <div className="rounded-3xl bg-slate-950 p-4 text-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Operations overview</p>
                        <h2 className="mt-2 text-xl font-semibold text-white">Live performance</h2>
                      </div>
                      <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">On track</span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      {metrics.map((metric) => (
                        <div key={metric.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
                          <p className="text-2xl font-bold tracking-tighter text-white">{metric.value}</p>
                          <p className="mt-1 text-xs text-slate-400">{metric.label}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_0.8fr] motion-safe:animate-float">
                      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Route completion</span>
                          <span>84%</span>
                        </div>
                        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
                          <div className="h-full w-[84%] rounded-full bg-linear-to-r from-blue-500 to-cyan-400" />
                        </div>
                        <div className="mt-5 space-y-3">
                          {[
                            ["North zones", "14/18 pickups"],
                            ["Central routes", "9/12 pickups"],
                            ["South sectors", "11/13 pickups"],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between text-sm text-slate-300">
                              <span>{label}</span>
                              <span className="text-slate-100">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Drivers</p>
                          <p className="mt-2 text-3xl font-bold text-white">42</p>
                        </div>
                        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
                          <p className="text-xs uppercase tracking-[0.14em] text-slate-400">Collections</p>
                          <p className="mt-2 text-3xl font-bold text-white">1,248</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Platform capabilities</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tighter text-slate-950 sm:text-5xl">
                Built to run every part of the service chain.
              </h2>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {featureCards.map((card) => (
                <div key={card.title} className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                    {card.icon}
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{card.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-24 text-slate-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">How it works</p>
                <h2 className="mt-4 text-4xl font-bold tracking-tighter text-white sm:text-5xl">
                  Turn daily operations into an efficient system.
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-3">
                {[
                  ["01", "Create your organization"],
                  ["02", "Import residents & plan routes"],
                  ["03", "Dispatch and monitor in real time"],
                ].map(([number, title]) => (
                  <div key={number} className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">{number}</p>
                    <p className="mt-4 text-base font-semibold text-white">{title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-[0_18px_60px_rgba(15,23,42,0.05)] md:p-12">
              <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Built for PSPs</p>
                  <h2 className="mt-4 text-4xl font-semibold tracking-tighter text-slate-950">
                    Designed for the realities of waste operations in Nigeria.
                  </h2>
                  <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                    WastePickup combines route visibility, resident management, and payment tracking into one platform that feels built for operators, not just software vendors.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4 text-sm font-medium text-slate-700">
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">Lagos & Abuja ready</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">Paystack integrated</span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5">Offline-capable</span>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="rounded-[1.25rem] border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Monthly performance</p>
                        <p className="mt-2 text-3xl font-bold text-slate-950">₦8.4M</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">+18.2%</span>
                    </div>

                    <div className="mt-5 space-y-4">
                      {[
                        ["Resident collections", "72%"],
                        ["Route efficiency", "87%"],
                        ["On-time dispatch", "94%"],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>{label}</span>
                            <span className="font-medium text-slate-900">{value}</span>
                          </div>
                          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-linear-to-r from-blue-600 to-cyan-400" style={{ width: value }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <span className="text-lg font-semibold tracking-tighter text-slate-900">WastePickup</span>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">
                Modern waste operations software for private service providers managing collections, drivers, residents, and cash flow.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">Product</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><Link href="/about" className="hover:text-slate-900">About</Link></li>
                <li><Link href="/contact" className="hover:text-slate-900">Contact</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-slate-900">Privacy</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">Company</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><Link href="/terms-of-service" className="hover:text-slate-900">Terms</Link></li>
                <li><Link href="/signup" className="hover:text-slate-900">Get started</Link></li>
                <li><a href="mailto:hello@wastepickup.ng" className="hover:text-slate-900">Email</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">Connect</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li><a href="#" className="hover:text-slate-900">LinkedIn</a></li>
                <li><a href="#" className="hover:text-slate-900">X / Twitter</a></li>
                <li><a href="mailto:hello@wastepickup.ng" className="hover:text-slate-900">hello@wastepickup.ng</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
            <p>© 2025 WastePickup. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
