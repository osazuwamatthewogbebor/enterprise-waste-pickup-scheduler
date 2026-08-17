"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PublicShell from "@/src/components/public-shell";

export default function RequestLandingPage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!slug.trim()) {
      setError("Please enter your organization slug.");
      return;
    }

    setError("");
    router.push(`/request/${slug.trim().toLowerCase()}`);
  }

  return (
    <PublicShell>
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-slate-200 bg-white p-10 shadow-lg shadow-slate-200/40">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
              Resident request
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
              Submit your service request
            </h1>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Residents can submit pickup, missed collection, or bulk skip requests
              without logging in. Enter your organization slug to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div>
              <label htmlFor="slug" className="mb-2 block text-sm font-medium text-slate-700">
                Organization slug
              </label>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder="example-wasteco"
              />
              <p className="mt-2 text-xs text-slate-500">
                Ask your waste provider for your organization slug if you do not know it.
              </p>
            </div>

            <button
              type="submit"
              className="inline-flex w-full rounded-full bg-emerald-600 px-6 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 hover:bg-emerald-500 sm:w-auto"
            >
              Continue to request form
            </button>
          </form>
        </div>
      </div>
    </PublicShell>
  );
}
