"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { initializePayment } from "@/src/lib/actions/v1/__server__/invoice-actions";
import type { Invoice } from "@/src/generated/prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/src/components/ui/dialog";

export function PaystackPaymentDialog({ invoice }: { invoice: Invoice }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(initializePayment, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const url = (state.data as any)?.authorizationUrl;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      toast.success("Payment initialized. Redirecting to Paystack...");
      router.refresh();
    }
    if (state?.success === false) {
      toast.error(state.error || "Something went wrong");
    }
  }, [state, router]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
        title="Send payment link"
      >
        Send payment
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Send Payment Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium text-slate-700">Invoice:</span>{" "}
              {invoice.invoiceNumber}
            </p>
            <p>
              <span className="font-medium text-slate-700">Amount:</span>{" "}
              ₦{(invoice.amount / 100).toLocaleString("en-NG")}
            </p>
            <p className="text-slate-600">
              You will be redirected to Paystack to complete the payment for this invoice.
            </p>
          </div>
          <form action={formAction}>
            <input type="hidden" name="invoiceId" value={invoice.id} />
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
                {pending ? "Initializing..." : "Initialize Payment"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
