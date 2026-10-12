"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { initializePayment } from "@/src/lib/actions/v1/__server__/invoice-actions";

export function ResidentPayButton({ invoiceId, amount }: { invoiceId: string; amount: number }) {
  const [state, formAction, pending] = useActionState(initializePayment, null);

  useEffect(() => {
    if (state?.success) {
      const url = (state.data as any)?.authorizationUrl;
      if (url) {
        toast.success("Redirecting to Paystack checkout...");
        window.location.href = url;
      }
    }
    if (state?.success === false) {
      toast.error(state.error || "Failed to initialize payment");
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="invoiceId" value={invoiceId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 transition"
      >
        {pending ? "Connecting..." : `Pay ₦${Number(amount).toLocaleString("en-NG")}`}
      </button>
    </form>
  );
}

