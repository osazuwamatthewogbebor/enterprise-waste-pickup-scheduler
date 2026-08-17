"use client";

import Link from "next/link";
import { Logo } from "@/src/components/logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white/90">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <div className="flex items-start gap-4">
            <Logo compact />
            <div>
              <p className="text-base font-semibold text-slate-900">WastePickup</p>
              <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">
                Modern operations software for waste collections, resident billing,
                and driver performance.
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
              Product
            </p>
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
              <li>
                <Link href="/terms-of-service" className="hover:text-slate-900">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
              Company
            </p>
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
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-900">
              Support
            </p>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>
                <a
                  href="mailto:hello@wastepickup.ng"
                  className="hover:text-slate-900"
                >
                  hello@wastepickup.ng
                </a>
              </li>
              <li className="text-slate-500">Lagos, Nigeria</li>
              <li className="text-slate-500">Available Mon–Fri</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-500">
          © {year} WastePickup. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
