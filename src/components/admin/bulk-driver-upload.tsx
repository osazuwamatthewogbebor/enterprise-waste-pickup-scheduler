"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { importDrivers } from "@/src/lib/actions/v1/__server__/driver-actions";

const CSV_HEADERS = ["firstName", "lastName", "phone", "password", "zoneId"];

export function BulkDriverUpload() {
  const [state, formAction, pending] = useActionState(importDrivers, null);
  const [fileName, setFileName] = useState("");
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) {
      const data = state.data;
      toast.success(
        `Imported: ${data.created} created, ${data.updated} updated, ${data.skipped} skipped, ${data.errors.length} errors`
      );
      setFileName("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      router.refresh();
    }
    if (state?.success === false) {
      toast.error(state.error || "Import failed");
    }
  }, [state, router]);

  function downloadTemplate() {
    const csvContent =
      CSV_HEADERS.join(",") +
      "\n" +
      "Ifedayo,Adewale,+2348022223333,pass1234,Ikoyi\n" +
      "Ebele,Okon,+2348033334444,welcome1,Victoria Island\n";
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drivers-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Bulk upload drivers (CSV)</h2>
      <p className="mt-1 text-sm text-slate-600">
        Upload a CSV with columns: firstName, lastName, phone, password, zoneId
        (optional). Existing drivers by phone are updated.
      </p>

      <button
        type="button"
        onClick={downloadTemplate}
        className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        Download template
      </button>

      <form action={formAction} className="mt-4">
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center hover:border-emerald-400">
            <input
              type="file"
              name="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
              required
            />
            <div>
              <svg
                className="mx-auto h-8 w-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4h10v12m-6 4h.01M14 20h.01M7 20h.01M10 2v4m4-4v4"
                />
              </svg>
              <span className="mt-1 text-sm font-medium text-slate-700">Choose CSV file</span>
              {fileName && <span className="ml-2 text-xs text-slate-500">{fileName}</span>}
            </div>
          </label>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Importing..." : "Import drivers"}
        </button>
      </form>

      {state?.success && state.data?.errors && state.data.errors.length > 0 && (
        <div className="mt-4 space-y-1">
          <p className="text-sm font-medium text-slate-700">
            Errors ({state.data.errors.length}):
          </p>
          {state.data.errors.slice(0, 10).map((err: { row: number; message: string }) => (
            <p key={err.row} className="text-xs text-red-600">
              Row {err.row}: {err.message}
            </p>
          ))}
          {state.data.errors.length > 10 && (
            <p className="text-xs text-red-600">
              ...and {state.data.errors.length - 10} more errors
            </p>
          )}
        </div>
      )}
    </div>
  );
}
