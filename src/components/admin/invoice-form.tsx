"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createInvoice } from "@/src/lib/actions/v1/__server__/invoice-actions";
import type { User } from "@/src/generated/prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

export function InvoiceDialog({ residents }: { residents: User[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createInvoice, null);
  const router = useRouter();

  const [residentId, setResidentId] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (state?.success) {
      toast.success("Invoice created");
      setOpen(false);
      setResidentId("");
      setAmount("");
      setDueDate("");
      router.refresh();
    }
    if (state?.success === false) {
      toast.error(state.error || "Something went wrong");
    }
  }, [state, router]);

  const fieldErrors = state?.success === false ? (state.fieldErrors as Record<string, string> | undefined) : undefined;
  const eligibleResidents = residents.filter((r) => r.accountStatus === "CLAIMED");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        New Invoice
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Resident</label>
              <select
                name="residentId"
                value={residentId}
                onChange={(e) => setResidentId(e.target.value)}
                required
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${
                  fieldErrors?.residentId ? "border-red-300" : "border-slate-300"
                }`}
              >
                <option value="">Select a resident</option>
                {eligibleResidents.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.firstName} {r.lastName} ({r.phone})
                  </option>
                ))}
              </select>
              {fieldErrors?.residentId && <p className="mt-1 text-xs text-red-600">{fieldErrors.residentId}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Amount (₦)</label>
              <input
                type="number"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                required
                min="1"
                step="100"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 ${
                  fieldErrors?.amount ? "border-red-300" : "border-slate-300"
                }`}
              />
              {fieldErrors?.amount && <p className="mt-1 text-xs text-red-600">{fieldErrors.amount}</p>}
              <p className="mt-1 text-xs text-slate-500">Amount in kobo (₦1 = 100 kobo)</p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Due date (optional)</label>
              <input
                type="date"
                name="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
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
                {pending ? "Saving..." : "Create invoice"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
