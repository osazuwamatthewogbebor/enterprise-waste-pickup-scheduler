"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { bulkDriverAction } from "@/src/lib/actions/v1/__server__/driver-actions";
import { DriverDialog, DriverStatusToggle } from "@/src/components/admin/driver-form";
import { ResetPasswordButton } from "@/src/components/admin/reset-password-button";
import type { Zone } from "@/src/generated/prisma/client";

interface Driver {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  accountStatus: "CLAIMED" | "UNCLAIMED";
  zone: { id: string; name: string } | null;
}

export function DriversTable({ drivers, zones }: { drivers: Driver[]; zones: Zone[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkZone, setBulkZone] = useState("");
  const [state, formAction, pending] = useActionState(bulkDriverAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      if (state.data?.updated) toast.success(`${state.data.updated} driver(s) updated`);
      setSelected(new Set());
      setBulkZone("");
      router.refresh();
    }
    if (state?.success === false) {
      toast.error((state as any).error || "Something went wrong");
    }
  }, [state, router]);

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const selectAll = () => {
    if (selected.size === drivers.length) setSelected(new Set());
    else setSelected(new Set(drivers.map((d) => d.id)));
  };

  const runBulk = (action: string, zoneId = "") => {
    if (selected.size === 0) return;
    const formData = new FormData();
    formData.set("ids", JSON.stringify(Array.from(selected)));
    formData.set("action", action);
    if (zoneId) formData.set("zoneId", zoneId);
    formAction(formData);
  };

  const anySelected = selected.size > 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-600">{selected.size} selected</span>

          <select
            value={bulkZone}
            onChange={(e) => setBulkZone(e.target.value)}
            disabled={pending || !anySelected}
            className="rounded-lg border border-slate-300 px-2 py-1 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Assign to zone…</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (bulkZone) runBulk("assignZone", bulkZone);
            }}
            disabled={pending || !anySelected || !bulkZone}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Apply zone
          </button>

          <button
            onClick={() => {
              if (confirm(`Activate ${selected.size} driver(s)?`)) runBulk("activate");
            }}
            disabled={pending || !anySelected}
            className="rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Activate
          </button>
          <button
            onClick={() => {
              if (confirm(`Deactivate ${selected.size} driver(s)? They will lose login access.`))
                runBulk("deactivate");
            }}
            disabled={pending || !anySelected}
            className="rounded-lg border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
          >
            Deactivate
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-2 text-center">
                <input
                  type="checkbox"
                  checked={drivers.length > 0 && selected.size === drivers.length}
                  onChange={selectAll}
                  disabled={pending}
                  aria-label="Select all drivers"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Zone</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  No drivers yet. Create your first driver to get started.
                </td>
              </tr>
            ) : (
              drivers.map((driver) => (
                <tr key={driver.id} className="border-b border-slate-200">
                  <td className="px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selected.has(driver.id)}
                      onChange={() => toggle(driver.id)}
                      disabled={pending}
                      aria-label={`Select ${driver.firstName} ${driver.lastName}`}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    {driver.firstName} {driver.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{driver.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {driver.zone?.name ?? "&mdash;"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        driver.accountStatus === "CLAIMED"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {driver.accountStatus === "CLAIMED" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center space-x-2">
                    <DriverDialog
                      zones={zones}
                      driver={{
                        id: driver.id,
                        firstName: driver.firstName,
                        lastName: driver.lastName,
                        phone: driver.phone,
                        accountStatus: driver.accountStatus,
                        zone: driver.zone ? { id: driver.zone.id, name: driver.zone.name } : null,
                      }}
                      onDriverSaved={() => setSelected(new Set())}
                    />
                    <DriverStatusToggle driver={driver} />
                    <ResetPasswordButton userId={driver.id} role="driver" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
