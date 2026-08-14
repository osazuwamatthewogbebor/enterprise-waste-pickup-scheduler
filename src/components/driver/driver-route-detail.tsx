"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateRouteStatus } from "@/src/lib/actions/v1/__server__/route-actions";
import { updatePickup, uploadPickupPhoto } from "@/src/lib/actions/v1/__server__/pickup-actions";
import { DriverMap } from "@/src/components/driver-map";

interface Stop {
  id: string;
  stopOrder: number;
  address: string;
  status: string;
  note: string | null;
  photoUrl: string | null;
  needsReview: boolean;
  latitude: number | null;
  longitude: number | null;
  resident: { id: string; firstName: string | null; lastName: string | null; phone: string } | null;
}

interface RouteWithRelations {
  id: string;
  name: string;
  date: string;
  status: string;
  notes: string | null;
  driver: { id: string; firstName: string | null; lastName: string | null } | null;
  zone: { id: string; name: string } | null;
}

export function DriverRouteDetail({ route, stops }: { route: RouteWithRelations; stops: Stop[] }) {
  const router = useRouter();
  const [statusState, statusAction, statusPending] = useActionState(updateRouteStatus, null);
  const [pickupState, pickupAction] = useActionState(updatePickup, null);
  const [photoState, photoAction, photoPending] = useActionState(uploadPickupPhoto, null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);

  useEffect(() => {
    if (statusState?.success) {
      toast.success("Route status updated");
      router.refresh();
    }
    if (statusState?.success === false) {
      toast.error((statusState as any).error || "Something went wrong");
    }
  }, [statusState, router]);

  useEffect(() => {
    if (pickupState?.success) {
      toast.success(`Stop marked as ${(pickupState.data as any).status}`);
      router.refresh();
    }
    if (pickupState?.success === false) {
      toast.error((pickupState as any).error || "Something went wrong");
    }
  }, [pickupState, router]);

  useEffect(() => {
    if (photoState?.success) {
      toast.success("Photo uploaded");
      router.refresh();
    }
    if (photoState?.success === false) {
      toast.error((photoState as any).error || "Upload failed");
    }
  }, [photoState, router]);

  const canStart = route.status === "SCHEDULED";
  const canComplete = route.status === "IN_PROGRESS";

  const pendingStops = stops.filter((s) => s.status === "PENDING");
  const mapStops = stops.filter((s) => s.latitude && s.longitude);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{route.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {route.zone?.name} · {new Date(route.date).toLocaleDateString("en-NG")}
          </p>
        </div>
        <span
          className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${
            route.status === "SCHEDULED"
              ? "bg-slate-100 text-slate-700"
              : route.status === "IN_PROGRESS"
              ? "bg-blue-100 text-blue-700"
              : route.status === "COMPLETED"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {route.status}
        </span>
      </div>

      {mapStops.length > 0 && (
        <div className="mb-6">
          <DriverMap stops={mapStops as any} />
        </div>
      )}

      <div className="mb-4 flex gap-2">
        {canStart && (
          <form action={statusAction}>
            <input type="hidden" name="routeId" value={route.id} />
            <input type="hidden" name="status" value="IN_PROGRESS" />
            <button
              type="submit"
              disabled={statusPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {statusPending ? "Starting..." : "Start Route"}
            </button>
          </form>
        )}
        {canComplete && (
          <form action={statusAction}>
            <input type="hidden" name="routeId" value={route.id} />
            <input type="hidden" name="status" value="COMPLETED" />
            <button
              type="submit"
              disabled={statusPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {statusPending ? "Completing..." : "Complete Route"}
            </button>
          </form>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-slate-700">
          Stops ({pendingStops.length} pending, {stops.length} total)
        </h2>

        {stops.length === 0 ? (
          <p className="text-sm text-slate-500">No stops on this route.</p>
        ) : (
          stops.map((stop) => (
            <StopCard
              key={stop.id}
              stop={stop}
              pickupAction={pickupAction}
              photoAction={photoAction}
              photoPending={photoPending}
              activeStopId={activeStopId}
              setActiveStopId={setActiveStopId}
            />
          ))
        )}
      </div>
    </div>
  );
}

function StopCard({
  stop,
  pickupAction,
  photoAction,
  photoPending,
  activeStopId,
  setActiveStopId,
}: {
  stop: Stop;
  pickupAction: (formData: FormData) => void;
  photoAction: (formData: FormData) => void;
  photoPending: boolean;
  activeStopId: string | null;
  setActiveStopId: (id: string | null) => void;
}) {
  const statusColor =
    stop.status === "COMPLETED"
      ? "bg-emerald-100 text-emerald-700"
      : stop.status === "MISSED"
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 ${
        stop.status === "PENDING" ? "border-l-4 border-l-blue-500" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">
            {stop.stopOrder}
          </div>
          <div>
            <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
              {stop.status}
            </span>
            <p className="mt-1 text-sm font-medium text-slate-900">{stop.address}</p>
            {stop.resident && (
              <p className="text-xs text-slate-500">
                {stop.resident.firstName} {stop.resident.lastName} · {stop.resident.phone}
              </p>
            )}
            {stop.needsReview && (
              <span className="mt-1 inline-block text-xs text-amber-600">⚠ Needs review</span>
            )}
          </div>
        </div>

        {stop.photoUrl && (
          <img src={stop.photoUrl} alt="Photo" className="h-20 w-20 rounded border border-slate-200 object-cover" />
        )}
      </div>

      {stop.status === "PENDING" && (
        <div className="mt-3 space-y-2">
          <form action={photoAction} encType="multipart/form-data">
            <input type="hidden" name="stopId" value={stop.id} />
            <div className="flex items-center gap-2">
              <input
                type="file"
                name="photo"
                accept="image/*"
                capture="environment"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setActiveStopId(stop.id);
                  e.target.form?.requestSubmit();
                }}
                className="text-xs text-slate-600"
              />
              {photoPending && activeStopId === stop.id && <span className="text-xs text-slate-500">Uploading...</span>}
            </div>
          </form>

          <div className="flex gap-2">
            <form action={pickupAction}>
              <input type="hidden" name="stopId" value={stop.id} />
              <input type="hidden" name="status" value="COMPLETED" />
              <button
                type="submit"
                className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Mark Complete
              </button>
            </form>
            <form action={pickupAction}>
              <input type="hidden" name="stopId" value={stop.id} />
              <input type="hidden" name="status" value="MISSED" />
              <button
                type="submit"
                className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Mark Missed
              </button>
            </form>
          </div>
        </div>
      )}

      {stop.note && <p className="mt-2 text-xs text-slate-600">Note: {stop.note}</p>}
    </div>
  );
}
