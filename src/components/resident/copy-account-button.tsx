"use client";

import { useState } from "react";
import { toast } from "sonner";

export function CopyAccountButton({ accountNumber }: { accountNumber: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopied(true);
      toast.success("Account number copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy account number");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition"
      title="Copy Account Number"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

