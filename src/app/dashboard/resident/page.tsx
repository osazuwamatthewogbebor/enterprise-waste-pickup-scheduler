import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/src/lib/auth";

export default async function ResidentHome() {
  const session = (await getServerSession(authOptions as any)) as any;
  const orgSlug = session?.user?.orgSlug ?? "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My account</h1>
        <p className="mt-2 text-sm text-slate-600">View your service details, invoices, and submit a request.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={`/request/${orgSlug}`}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <h2 className="text-lg font-semibold text-slate-900">Submit a service request</h2>
          <p className="mt-2 text-sm text-slate-600">Create a pickup or missed collection request for your address.</p>
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Billing and invoices</h2>
          <p className="mt-2 text-sm text-slate-600">View invoices, payment history, and account charges coming soon.</p>
        </div>
      </div>

      {orgSlug ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          <p>
            Your current organization slug is <strong>{orgSlug}</strong>. Use this link to access the public request form directly.
          </p>
          <p className="mt-2 text-xs text-slate-500">/request/{orgSlug}</p>
        </div>
      ) : null}
    </div>
  );
}
