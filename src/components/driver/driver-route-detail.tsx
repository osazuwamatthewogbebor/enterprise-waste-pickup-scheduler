"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateRouteStatus } from "@/src/lib/actions/v1/__server__/route-actions";
import { updatePickup, uploadPickupPhoto } from "@/src/lib/actions/v1/__server__/pickup-actions";
import { DriverMap } from "@/src/components/driver-map";
import { watermarkProofPhoto, enqueueOfflineAction, getOfflineQueue, removeOfflineAction } from "@/src/lib/offline-sync";

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
  const [photoState, photoAction] = useActionState(uploadPickupPhoto, null);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);

  useEffect(() => {
    setIsOffline(typeof navigator !== "undefined" ? !navigator.onLine : false);
    setOfflineCount(getOfflineQueue().length);

    const handleOnline = async () => {
      setIsOffline(false);
      const queue = getOfflineQueue();
      if (queue.length === 0) return;
      toast.info(`Syncing ${queue.length} cached pickup stops...`);
      for (const item of queue) {
        const fd = new FormData();
        fd.append("stopId", item.stopId);
        fd.append("status", item.status);
        if (item.note) fd.append("note", item.note);
        await updatePickup(null, fd);
        removeOfflineAction(item.id);
      }
      setOfflineCount(0);
      toast.success("Offline proof-of-service records synced to server!");
      router.refresh();
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.warning("Network connection lost. Offline-first driver mode active.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);


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
        {isOffline && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span><strong>Offline Mode:</strong> No network connection. Changes will be saved to device storage and synchronized automatically when reconnected.</span>
            </div>
            {offlineCount > 0 && <span className="font-semibold">{offlineCount} queued</span>}
          </div>
        )}

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
              activeStopId={activeStopId}
              setActiveStopId={setActiveStopId}
              onOfflineQueue={() => setOfflineCount(getOfflineQueue().length)}
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
  activeStopId,
  setActiveStopId,
  onOfflineQueue,
}: {
  stop: Stop;
  pickupAction: (formData: FormData) => void;
  photoAction: (formData: FormData) => void;
  activeStopId: string | null;
  setActiveStopId: (id: string | null) => void;
  onOfflineQueue?: () => void;
}) {
  const [photoUploading, setPhotoUploading] = useState(false);
  const [localStatus, setLocalStatus] = useState<string | null>(null);

  const displayStatus = localStatus || stop.status;
  const statusColor =
    displayStatus === "COMPLETED"
      ? "bg-emerald-100 text-emerald-700"
      : displayStatus === "MISSED"
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-700";

  const handleStatus = (status: "COMPLETED" | "MISSED") => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      enqueueOfflineAction({
        stopId: stop.id,
        status,
        latitude: stop.latitude ?? undefined,
        longitude: stop.longitude ?? undefined,
        note: "Offline proof recorded",
      });
      setLocalStatus(status);
      onOfflineQueue?.();
      toast.info(`Offline: Stop marked ${status}. Will sync automatically when connected.`);
      return;
    }

    const formData = new FormData();
    formData.append("stopId", stop.id);
    formData.append("status", status);
    pickupAction(formData);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveStopId(stop.id);
    setPhotoUploading(true);

    try {
      const watermarkedBlob = await watermarkProofPhoto(file, {
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
      });

      const watermarkedFile = new File([watermarkedBlob], `proof-${stop.id}.jpg`, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("stopId", stop.id);
      formData.append("photo", watermarkedFile);
      photoAction(formData);
    } catch {
      const formData = new FormData();
      formData.append("stopId", stop.id);
      formData.append("photo", file);
      photoAction(formData);
    } finally {
      setPhotoUploading(false);
    }
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 ${
        displayStatus === "PENDING" ? "border-l-4 border-l-blue-500" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700">
            {stop.stopOrder}
          </div>
          <div>
            <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
              {displayStatus}
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

      {displayStatus === "PENDING" && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">
              📸 Take GPS Proof Photo
              <input
                type="file"
                name="photo"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
            {(photoUploading || activeStopId === stop.id) && (
              <span className="text-xs text-slate-500">Watermarking & uploading...</span>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleStatus("COMPLETED")}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              Mark Complete
            </button>
            <button
              type="button"
              onClick={() => handleStatus("MISSED")}
              className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Mark Missed
            </button>
          </div>
        </div>
      )}

      {stop.note && <p className="mt-2 text-xs text-slate-600">Note: {stop.note}</p>}
    </div>
  );
}
