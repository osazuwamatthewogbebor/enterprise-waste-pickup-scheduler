import { FaTruckPickup } from "react-icons/fa";

export function Logo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
        <FaTruckPickup className="h-4 w-4 text-white" aria-hidden="true" />
      </div>
    );
  }

  return (
    <>
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
        <FaTruckPickup className="h-5 w-5 text-white" aria-hidden="true" />
      </div>
      <div>
        <span className="block text-base font-semibold tracking-[-0.03em] text-slate-900">
          WastePickup
        </span>
        <span className="block text-xs uppercase tracking-[0.2em] text-slate-500">
          Operations platform
        </span>
      </div>
    </>
  );
}
