"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
          <div className="w-full max-w-md rounded-4xl border border-slate-800 bg-slate-900/95 p-10 shadow-[0_40px_120px_rgba(15,23,42,0.4)]">
            <h1 className="text-3xl font-semibold tracking-tight">Something went wrong</h1>
            <p className="mt-4 text-slate-300">{error.message || "An unexpected error occurred."}</p>
            <button
              onClick={reset}
              className="mt-8 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
