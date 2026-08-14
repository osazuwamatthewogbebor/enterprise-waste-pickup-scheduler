"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { updateRouteStatus, reorderStops } from "@/src/lib/actions/v1/__server__/route-actions";
import { updatePickup } from "@/src/lib/actions/v1/__server__/pickup-actions";

interface Stop {
  id: string;
  stopOrder: number;
  address: string;
  status: string;
  note: string | null;
  photoUrl: string | null;
  needsReview: boolean;
  resident: { id: string; firstName: string | null; lastName: string | null; phone: string } | null;
}

interface Route {
  id: string;
  name: string;
  date: string;
  status: string;
  notes: string | null;
  driver: { id: string; firstName: string | null; lastName: string | null } | null;
  zone: { id: string; name: string } | null;
}

export function RouteDetail({ route, stops }: { route: Route; stops: Stop[] }) {
  const router = useRouter();
  const [localStops, setLocalStops] = useState<Stop[]>(stops);
  const [statusState, statusAction, statusPending] = useActionState(updateRouteStatus, null);
  const [reorderState, reorderAction, reorderPending] = useActionState(reorderStops, null);
  const [pickupState, pickupAction] = useActionState(updatePickup, null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (statusState?.success) {
      toast.success("Route status updated");
      router.refresh();
    }
    if (statusState?.success === false) {
      toast.error(statusState.error || "Something went wrong");
    }
  }, [statusState, router]);

  useEffect(() => {
    if (reorderState?.success) {
      toast.success("Stop order saved");
    }
    if (reorderState?.success === false) {
      toast.error(reorderState.error || "Something went wrong");
    }
  }, [reorderState]);

  useEffect(() => {
    if (pickupState?.success) {
      toast.success(`Stop marked as ${pickupState.data.status}`);
      router.refresh();
    }
    if (pickupState?.success === false) {
      toast.error(pickupState.error || "Something went wrong");
    }
  }, [pickupState, router]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalStops((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over!.id);
      return arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        stopOrder: idx + 1,
      }));
    });
  }

  function handleSaveOrder() {
    const fd = new FormData();
    fd.set("routeId", route.id);
    fd.set(
      "stops",
      JSON.stringify(localStops.map((s) => ({ id: s.id, stopOrder: s.stopOrder })))
    );
    reorderAction(fd);
  }

  function handleStatusChange(status: string) {
    const fd = new FormData();
    fd.set("routeId", route.id);
    fd.set("status", status);
    statusAction(fd);
  }

  function markPickup(stopId: string, status: "COMPLETED" | "MISSED") {
    const fd = new FormData();
    fd.set("stopId", stopId);
    fd.set("status", status);
    pickupAction(fd);
  }

  const hasReordered = JSON.stringify(localStops.map((s) => s.stopOrder)) !== JSON.stringify(stops.map((s) => s.stopOrder));

  const canStart = route.status === "SCHEDULED";
  const canComplete = route.status === "IN_PROGRESS";
  const canCancel = route.status === "SCHEDULED" || route.status === "IN_PROGRESS";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{route.name}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {route.zone?.name} · {new Date(route.date).toLocaleDateString("en-NG")} ·
            Driver: {route.driver ? `${route.driver.firstName ?? ""} ${route.driver.lastName ?? ""}`.trim() : "—"}
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

      <div className="flex flex-wrap gap-2">
        {canStart && (
          <button
            onClick={() => handleStatusChange("IN_PROGRESS")}
            disabled={statusPending}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Start Route
          </button>
        )}
        {canComplete && (
          <button
            onClick={() => handleStatusChange("COMPLETED")}
            disabled={statusPending}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            Complete Route
          </button>
        )}
        {canCancel && (
          <button
            onClick={() => handleStatusChange("CANCELLED")}
            disabled={statusPending}
            className="rounded-lg bg-slate-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
          >
            Cancel Route
          </button>
        )}
        <button
          onClick={handleSaveOrder}
          disabled={reorderPending || !hasReordered}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {reorderPending ? "Saving..." : "Save Order"}
        </button>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-slate-700">Pickup Stops ({localStops.length})</h2>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={localStops.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            {localStops.map((stop) => (
              <SortableStop key={stop.id} stop={stop} onMarkPickup={markPickup} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortableStop({
  stop,
  onMarkPickup,
}: {
  stop: Stop;
  onMarkPickup: (stopId: string, status: "COMPLETED" | "MISSED") => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const statusColor =
    stop.status === "COMPLETED"
      ? "bg-emerald-100 text-emerald-700"
      : stop.status === "MISSED"
      ? "bg-red-100 text-red-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl border border-slate-200 bg-white p-4 ${
        stop.status === "PENDING" ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-slate-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-700"
            style={{ transform: "rotate(-45deg)" }}
          >
            <span style={{ transform: "rotate(45deg)" }}>{stop.stopOrder}</span>
          </div>
          <div>
            <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor}`}>
              {stop.status}
            </span>
            <p className="mt-1 text-sm text-slate-900">{stop.address}</p>
            {stop.resident && (
              <p className="text-xs text-slate-500">
                {stop.resident.firstName} {stop.resident.lastName} · {stop.resident.phone}
              </p>
            )}
          </div>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab rounded p-1 text-slate-400 hover:bg-slate-100 active:cursor-grabbing"
            title="Drag to reorder"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12h.01M12 12h.01M17 12h.01M7 15h.01M12 15h.01M17 15h.01" />
            </svg>
          </div>
        </div>

        {stop.status === "PENDING" && (
          <div className="flex gap-1">
            <button
              onClick={() => onMarkPickup(stop.id, "COMPLETED")}
              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700"
              title="Mark completed"
            >
              Done
            </button>
            <button
              onClick={() => onMarkPickup(stop.id, "MISSED")}
              className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
              title="Mark missed"
            >
              Miss
            </button>
          </div>
        )}

        {stop.needsReview && (
          <span className="absolute top-2 right-2 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
            Needs review
          </span>
        )}
      </div>

      {stop.photoUrl && (
        <div className="mt-2">
          <img src={stop.photoUrl} alt="Pickup photo" className="h-16 w-24 rounded border border-slate-200 object-cover" />
        </div>
      )}

      {stop.note && <p className="mt-2 text-xs text-slate-600">Note: {stop.note}</p>}
    </div>
  );
}
