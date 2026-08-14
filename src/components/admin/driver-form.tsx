"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createDriver, updateDriver, deleteDriver } from "@/src/lib/actions/v1/__server__/driver-actions";
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
  phone: string | null;
  zone: { id: string; name: string } | null;
}

interface DriverDialogProps {
  zones: Zone[];
  driver?: Driver | null;
  onDriverSaved?: () => void;
}

export function DriverDialog({ zones, driver, onDriverSaved }: DriverDialogProps) {
  const [open, setOpen] = useState(false);
  const [stateCreate, formActionCreate, pendingCreate] = useActionState(createDriver, null);
  const [stateUpdate, formActionUpdate, pendingUpdate] = useActionState(updateDriver, null);
  const router = useRouter();

  const isEdit = !!driver;
  const [firstName, setFirstName] = useState(driver?.firstName ?? "");
  const [lastName, setLastName] = useState(driver?.lastName ?? "");
  const [phone, setPhone] = useState(driver?.phone ?? "");
  const [password, setPassword] = useState("");
  const [zoneId, setZoneId] = useState(driver?.zone?.id ?? "");

  useEffect(() => {
    if (stateCreate?.success || stateUpdate?.success) {
      toast.success(isEdit ? "Driver updated" : "Driver created");
      setOpen(false);
      onDriverSaved?.();
      router.refresh();
    }
    if (stateCreate?.success === false || stateUpdate?.success === false) {
      const errState = (stateCreate ?? stateUpdate) as any;
      toast.error(errState?.error || "Something went wrong");
    }
  }, [stateCreate, stateUpdate, isEdit, onDriverSaved, router]);

  const errors = (stateCreate ?? stateUpdate) as any;
  const fieldErrors = errors?.success === false ? errors?.fieldErrors as Record<string, string> | undefined : undefined;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    if (isEdit && driver) {
      formData.append("driverId", driver.id);
    }
    if (isEdit) {
      formActionUpdate(formData);
    } else {
      formActionCreate(formData);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        {isEdit ? "Edit" : "New Driver"}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit Driver" : "Create Driver"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="driverId" value={driver?.id ?? ""} />
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

            {!isEdit && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors?.password ? "border-red-300" : "border-slate-300"
                  }`}
                />
                {fieldErrors?.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
              </div>
            )}

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
                disabled={pendingCreate || pendingUpdate}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {pendingCreate || pendingUpdate ? "Saving..." : isEdit ? "Update driver" : "Create driver"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DeleteDriverButton({ driver }: { driver: Driver }) {
  const [state, formAction, pending] = useActionState(deleteDriver, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success("Driver deactivated");
      router.refresh();
    }
    if (state?.success === false) {
      toast.error(state.error || "Something went wrong");
    }
  }, [state, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="driverId" value={driver.id} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-red-600 hover:text-red-800"
      >
        Deactivate
      </button>
    </form>
  );
}
