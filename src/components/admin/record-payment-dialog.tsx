"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { recordManualPayment } from "@/src/lib/actions/v1/__server__/invoice-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

interface InvoiceRecordProps {
  invoice: {
    id: string;
    invoiceNumber: string;
    amount: number;
    resident?: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
    } | null;
  };
}

export function RecordPaymentDialog({ invoice }: InvoiceRecordProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(recordManualPayment, null);
  const router = useRouter();

  const residentName =
    `${invoice.resident?.firstName ?? ""} ${invoice.resident?.lastName ?? ""}`.trim() || "Resident";

  useEffect(() => {
    if (state?.success) {
      toast.success(`Payment recorded! ${invoice.invoiceNumber} marked as PAID.`);
      setOpen(false);
      router.refresh();
    }
    if (state?.success === false) {
      toast.error(state.error || "Failed to record payment");
    }
  }, [state, invoice.invoiceNumber, router]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 transition-colors"
        title="Record payment received from resident"
      >
        Record Payment
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Record Payment Received</DialogTitle>
          </DialogHeader>

          <form action={formAction} className="space-y-4">
            <input type="hidden" name="invoiceId" value={invoice.id} />

            <div className="rounded-lg bg-slate-50 p-3 text-sm space-y-1 border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice:</span>
                <span className="font-semibold text-slate-800">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Resident:</span>
                <span className="text-slate-800">
                  {residentName} {invoice.resident?.phone ? `(${invoice.resident.phone})` : ""}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1 mt-1">
                <span className="text-slate-500">Amount Due:</span>
                <span className="font-bold text-emerald-700">
                  ₦{Number(invoice.amount).toLocaleString("en-NG")}
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                defaultValue="CASH"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              >
                <option value="CASH">Cash Collection</option>
                <option value="BANK_TRANSFER">Direct Bank Transfer / USSD</option>
                <option value="POS">POS Terminal</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Receipt / Bank Reference (Optional)
              </label>
              <input
                type="text"
                name="reference"
                placeholder="e.g. TRF/GTB/098124 or Cash Slip #22"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Notes (Optional)
              </label>
              <input
                type="text"
                name="notes"
                placeholder="e.g. Paid in full to truck crew"
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
                {pending ? "Recording..." : "Confirm & Mark Paid"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
