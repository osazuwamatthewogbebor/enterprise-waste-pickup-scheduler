"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { HeaderAuth } from "@/src/components/header-auth";
import { Logo } from "@/src/components/logo";

const navItems = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Careers", href: "/careers" },
  { label: "Submit a service request", href: "/request" },
];

const linkClass =
  "text-sm font-medium text-slate-600 transition hover:text-slate-900";

export function Header() {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState("0px");
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = (next: boolean) => {
    if (next) {
      const h = `${panelRef.current?.scrollHeight ?? 0}px`;
      setHeight(h);
      setOpen(true);
    } else {
      setHeight("0px");
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: globalThis.PointerEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(t) &&
        !buttonRef.current?.contains(t)
      ) {
        toggle(false);
      }
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        toggle(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only-focusable md:hidden rounded-br-md bg-amber-950 px-4 py-2 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            <HeaderAuth />
          </div>
          <button
            ref={buttonRef}
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            className="relative isolate inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-slate-600 outline-none transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 md:hidden"
            onClick={() => toggle(!open)}
          >
            {!open ? (
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
                focusable="false"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 6 6 18M6 6l12 12"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div
        ref={panelRef}
        id="site-mobile-menu"
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${open ? "opacity-100" : "opacity-0"}`}
        style={{ maxHeight: height }}
      >
        <div className="border-t border-slate-200 bg-white">
          <nav className="flex flex-col gap-1 py-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                onClick={() => toggle(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-slate-200 px-4 py-4">
            <HeaderAuth stack align="left" />
          </div>
        </div>
      </div>
    </header>
  );
}
