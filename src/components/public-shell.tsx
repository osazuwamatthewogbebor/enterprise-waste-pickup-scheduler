import Link from "next/link";
import { HeaderAuth } from "@/src/components/header-auth";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold tracking-[-0.03em] text-slate-950">WastePickup</p>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Operations platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <Link href="/about" className="hover:text-slate-900">About</Link>
            <Link href="/features" className="hover:text-slate-900">Features</Link>
            <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
            <Link href="/careers" className="hover:text-slate-900">Careers</Link>
            <Link href="/request" className="hover:text-slate-900">Submit request</Link>
            <Link href="/contact" className="hover:text-slate-900">Contact</Link>
            <Link href="/privacy-policy" className="hover:text-slate-900">Privacy</Link>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <HeaderAuth />
          </div>
        </div>
      </header>

      <main>{children}</main>

      <footer className="border-t border-slate-200 bg-white/90">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">WastePickup</p>
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
                Modern operations software for waste collections, resident billing, and driver performance.
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">Product</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>
                  <Link href="/features" className="hover:text-slate-900">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-slate-900">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-slate-900">
                    About
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">Company</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>
                  <Link href="/contact" className="hover:text-slate-900">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-slate-900">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-slate-900">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">Support</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>
                  <a href="mailto:hello@wastepickup.ng" className="hover:text-slate-900">
                    hello@wastepickup.ng
                  </a>
                </li>
                <li className="text-slate-500">Lagos, Nigeria</li>
                <li className="text-slate-500">Available Mon-Fri</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
            © 2025 WastePickup. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
