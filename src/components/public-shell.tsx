"use client";

import { Header } from "@/src/components/header";
import { Footer } from "@/src/components/footer";

export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}
