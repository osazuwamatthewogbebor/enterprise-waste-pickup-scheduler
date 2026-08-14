"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createZone } from "@/src/lib/actions/v1/__server__/zone-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={3}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${
            error ? "border-red-300" : "border-slate-300"
          }`}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value ?? ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${
            error ? "border-red-300" : "border-slate-300"
          }`}
        />
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function ZoneDialog({ onZoneCreated }: { onZoneCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createZone, null);
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success("Zone created");
      setOpen(false);
      setName("");
      setDescription("");
      router.refresh();
      onZoneCreated?.();
    }
    if (state?.success === false) {
      toast.error(state.error || "Something went wrong");
    }
  }, [state, router, onZoneCreated]);

  const fieldErrors = state?.success === false ? (state.fieldErrors as Record<string, string> | undefined) : undefined;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        New Zone
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Create Zone</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <FormField
              label="Zone name"
              name="name"
              placeholder="Victoria Island"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              error={fieldErrors?.name}
            />
            <FormField
              label="Description (optional)"
              name="description"
              placeholder="Service area description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={fieldErrors?.description}
            />
            <input type="hidden" name="color" value="#d4622b" />
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
                {pending ? "Saving..." : "Save zone"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
