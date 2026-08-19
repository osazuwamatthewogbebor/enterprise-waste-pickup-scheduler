"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateResident } from "@/src/lib/actions/v1/__server__/resident-actions";
import { toggleResidentBlock, deleteResident } from "@/src/lib/actions/v1/__server__/resident-actions";
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

interface Resident {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  streetAddress: string | null;
  landmark: string | null;
  accountStatus: "CLAIMED" | "UNCLAIMED";
  zone: { id: string; name: string } | null;
}

export function ResidentDialog({
  zones,
  resident,
  onResidentSaved,
}: {
  zones: Zone[];
  resident: Resident;
  onResidentSaved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(updateResident, null);
  const router = useRouter();

  const [firstName, setFirstName] = useState(resident.firstName ?? "");
  const [lastName, setLastName] = useState(resident.lastName ?? "");
  const [phone, setPhone] = useState(resident.phone ?? "");
  const [streetAddress, setStreetAddress] = useState(resident.streetAddress ?? "");
  const [landmark, setLandmark] = useState(resident.landmark ?? "");
  const [zoneId, setZoneId] = useState(resident.zone?.id ?? "");

  useEffect(() => {
    if (state?.success) {
      toast.success("Resident updated");
      setOpen(false);
      onResidentSaved?.();
      router.refresh();
    }
    if (state?.success === false) {
      toast.error((state as any).error || "Something went wrong");
    }
  }, [state, onResidentSaved, router]);

  const fieldErrors =
    state?.success === false ? (state as any)?.fieldErrors as Record<string, string> | undefined : undefined;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    formData.append("residentId", resident.id);
    formAction(formData);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-slate-700 hover:text-slate-900"
      >
        Edit
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Edit Resident</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">First name</label>
              <input
                type="text"
                name="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${
                  fieldErrors?.firstName ? "border-red-300" : "border-slate-300"
                }`}
              />
              {fieldErrors?.firstName && <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Last name</label>
              <input
                type="text"
                name="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${
                  fieldErrors?.lastName ? "border-red-300" : "border-slate-300"
                }`}
              />
              {fieldErrors?.lastName && <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phone number</label>
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+2348012345678"
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${
                  fieldErrors?.phone ? "border-red-300" : "border-slate-300"
                }`}
              />
              {fieldErrors?.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Street address</label>
              <input
                type="text"
                name="streetAddress"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Landmark</label>
              <input
                type="text"
                name="landmark"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Zone</label>
              <select
                name="zoneId"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Unassigned</option>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
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
                {pending ? "Saving..." : "Update resident"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SuspendResidentButton({ resident }: { resident: Resident }) {
  const [state, formAction, pending] = useActionState(toggleResidentBlock, null);
  const router = useRouter();
  const isBlocked = resident.accountStatus === "UNCLAIMED";

  useEffect(() => {
    if (state?.success) {
      toast.success(isBlocked ? "Resident unblocked" : "Resident suspended");
      router.refresh();
    }
    if (state?.success === false) {
      toast.error((state as any).error || "Something went wrong");
    }
  }, [state, isBlocked, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="residentId" value={resident.id} />
      <button
        type="submit"
        disabled={pending}
        className={`text-xs font-medium ${
          isBlocked
            ? "text-amber-600 hover:text-amber-800"
            : "text-orange-600 hover:text-orange-800"
        }`}
      >
        {pending ? "…" : isBlocked ? "Unsuspend" : "Suspend"}
      </button>
    </form>
  );
}

export function DeleteResidentButton({ resident }: { resident: Resident }) {
  const [state, formAction, pending] = useActionState(deleteResident, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success("Resident deleted");
      router.refresh();
    }
    if (state?.success === false) {
      toast.error((state as any).error || "Something went wrong");
    }
  }, [state, router]);

  const handleDelete = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!confirm(`Delete ${resident.firstName ?? ""} ${resident.lastName ?? ""}? This cannot be undone.`)) {
      return;
    }
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    formData.append("residentId", resident.id);
    formAction(formData);
  };

  return (
    <form onSubmit={handleDelete}>
      <input type="hidden" name="residentId" value={resident.id} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-red-600 hover:text-red-800"
      >
        {pending ? "…" : "Delete"}
      </button>
    </form>
  );
}
