"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createRoute } from "@/src/lib/actions/v1/__server__/route-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

interface Zone {
  id: string;
  name: string;
}

interface Driver {
  id: string;
  firstName: string | null;
  lastName: string | null;
}

export function RouteDialog({
  onRouteCreated,
  zones,
  drivers,
}: {
  onRouteCreated?: () => void;
  zones: Zone[];
  drivers: Driver[];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createRoute, null);
  const router = useRouter();

  const [selectedZone, setSelectedZone] = useState("");
  const [selectedDriver, setSelectedDriver] = useState("");
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success("Route created");
      setOpen(false);
      setName("");
      setSelectedZone("");
      setSelectedDriver("");
      setDate("");
      router.refresh();
      onRouteCreated?.();
    }
    if (state?.success === false) {
      toast.error(state.error || "Something went wrong");
    }
  }, [state, router, onRouteCreated]);

  const fieldErrors = state?.success === false ? (state.fieldErrors as Record<string, string> | undefined) : undefined;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        New Route
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Create Route</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Route name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Morning Route - VI"
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${
                  fieldErrors?.name ? "border-red-300" : "border-slate-300"
                }`}
              />
              {fieldErrors?.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Zone</label>
              <select
                name="zoneId"
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select a zone</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
              {fieldErrors?.zoneId && <p className="mt-1 text-xs text-red-600">{fieldErrors.zoneId}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Driver</label>
              <select
                name="driverId"
                value={selectedDriver}
                onChange={(e) => setSelectedDriver(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Select a driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.firstName} {d.lastName}
                  </option>
                ))}
              </select>
              {fieldErrors?.driverId && <p className="mt-1 text-xs text-red-600">{fieldErrors.driverId}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
              <input
                type="date"
                name="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
              {fieldErrors?.date && <p className="mt-1 text-xs text-red-600">{fieldErrors.date}</p>}
            </div>

            <DialogFooter>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {pending ? "Creating..." : "Create route"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
