"use client";

import Link from "next/link";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const isCompany = role === "company";
  const isDriver = role === "driver";
  const combined = !isCompany && !isDriver;
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailOrPhone.includes("@") ? emailOrPhone : undefined,
          phone: emailOrPhone.includes("@") ? undefined : emailOrPhone,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="rounded-4xl border border-slate-200 bg-white p-10 shadow-lg shadow-slate-200/40">
          <div className="max-w-xl space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Secure access</p>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Sign in to your operations command center.
              </h1>
              <p className="mt-6 text-base leading-7 text-slate-600">
                Access route planning, driver coordination, and billing tools built for modern waste collection teams.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Faster dispatch</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">See routes, pickups, and field status in one place.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Trusted security</p>
                <p className="mt-4 text-sm leading-6 text-slate-600">Protected login flows for your team and operations data.</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Support</p>
              <p className="mt-4 text-sm leading-6 text-slate-600">Need help? Reach out to hello@wastepickup.ng for timely onboarding support.</p>
            </div>
          </div>
        </section>

        <section className="rounded-4xl border border-slate-200 bg-white p-10 shadow-lg shadow-slate-200/30">
          <div className="mb-6 flex items-center justify-between gap-4 text-sm text-slate-500">
            <Link href="/" className="font-medium text-slate-700 transition hover:text-slate-900">
              Back to home
            </Link>
            <span>Secure team login</span>
          </div>
          <div className="mb-8 space-y-3 text-center">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Sign in</p>
            <h2 className="text-3xl font-semibold text-slate-950">Welcome back</h2>
            <p className="text-sm leading-6 text-slate-600">Enter your details to continue managing your waste operation.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                {combined ? "Email or phone" : isCompany ? "Email" : "Phone number"}
              </label>
              <input
                type={combined ? "text" : isCompany ? "email" : "tel"}
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                placeholder={
                  combined
                    ? "admin@company.com or +2348012345678"
                    : isCompany
                      ? "admin@company.com"
                      : "+2348012345678"
                }
                required
              />
              <p className="mt-1 text-xs text-slate-500">
                {combined
                  ? "Company admins use email. Drivers use their phone number."
                  : isCompany
                    ? "Sign in with the email set up for your organization."
                    : "Sign in with your assigned phone number."}
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-5">
            <button
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.3v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.08z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-slate-950 hover:text-slate-700">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            Drivers: use your assigned phone number and password
          </p>
        </section>
      </div>
      <footer className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8">
        <div className="rounded-4xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href="/" className="font-medium text-slate-700 hover:text-slate-900">
              Back to home
            </Link>
            <p>Secure access for your operations team.</p>
          </div>
          <p className="mt-4 text-xs text-slate-400">© 2025 WastePickup. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
