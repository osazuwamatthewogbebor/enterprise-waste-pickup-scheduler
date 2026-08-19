"use client";

import { useState } from "react";
import { toast } from "sonner";

const REQUEST_TYPES = [
  { value: "BULK_SKIP", label: "Bulk skip" },
  { value: "ON_DEMAND", label: "On-demand pickup" },
  { value: "MISSED_PICKUP", label: "Missed pickup" },
];

interface Stop {
  id: string;
  address: string;
  status: string;
  route: {
    id: string;
    name: string;
    date: Date;
    status: string;
    driver: { firstName: string | null; lastName: string | null } | null;
  } | null;
}

export default function ResidentPortalView({ slug, stops }: { slug: string; stops: Stop[] }) {
  const [form, setForm] = useState({
    type: "BULK_SKIP",
    address: "",
    preferredDate: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/${slug}/resident/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to submit request");
        setSubmitting(false);
        return;
      }
      toast.success("Request submitted successfully");
      setForm({ type: "BULK_SKIP", address: "", preferredDate: "", notes: "" });
    } catch {
      toast.error("Something went wrong");
      setSubmitting(false);
    } finally {
      setSubmitting(false);
    }
  }

  const upcoming = [...stops].sort(
    (a, b) =>
      (a.route ? new Date(a.route.date).getTime() : 0) -
      (b.route ? new Date(b.route.date).getTime() : 0)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">My pickup portal</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your scheduled pickups and service requests for <strong>{slug}</strong>.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-medium text-slate-500 uppercase">Upcoming pickups</h2>
        {upcoming.length === 0 ? (
          <p className="text-sm text-slate-500">No scheduled pickups yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200">
            {upcoming.map((stop) => (
              <li key={stop.id} className="py-3">
                <p className="text-sm font-medium text-slate-900">{stop.address}</p>
                <p className="text-xs text-slate-500">
                  {stop.route ? (
                    <>
                      Route: {stop.route.name} · {new Date(stop.route.date).toLocaleDateString("en-NG")} · Status:{" "}
                      {stop.route.status} · Driver:{" "}
                      {stop.route.driver ? `${stop.route.driver.firstName ?? ""} ${stop.route.driver.lastName ?? ""}`.trim() : "—"}
                    </>
                  ) : (
                    "Unassigned route"
                  )}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-medium text-slate-500 uppercase">Submit a service request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Request type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            >
              {REQUEST_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Pickup address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              placeholder="Street address"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Preferred date (optional)</label>
            <input
              type="date"
              value={form.preferredDate}
              onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit request"}
          </button>
        </form>
      </div>
    </div>
  );
}
