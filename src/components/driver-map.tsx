"use client";

import { useEffect, useRef, useState } from "react";

type StopStatus = "PENDING" | "COMPLETED" | "MISSED";

interface Stop {
  id: string;
  stopOrder: number;
  address: string;
  status: StopStatus;
  latitude?: number | null;
  longitude?: number | null;
}

const LAGOS: [number, number] = [6.5244, 3.3792];

const STATUS_COLORS: Record<StopStatus, string> = {
  PENDING: "#3b82f6",
  COMPLETED: "#059669",
  MISSED: "#dc2626",
};

function pinElement(status: StopStatus, order: number): HTMLElement {
  const el = document.createElement("div");
  el.className = "map-pin";
  el.style.cssText = `
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    background: ${STATUS_COLORS[status] || STATUS_COLORS.PENDING};
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 600;
  `;
  el.innerHTML = `<span style="transform: rotate(45deg)">${order}</span>`;
  return el;
}

export function DriverMap({ stops }: { stops: Stop[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    let map: any;
    let cancelled = false;

    import("leaflet")
      .then((mod) => {
        if (cancelled) return;
        const L: any = (mod as any).default ?? (mod as any);

        const first = stops.find((s) => s.latitude && s.longitude);
        const center: [number, number] = first ? [first.latitude!, first.longitude!] : LAGOS;
        const zoom = first ? 16 : 11;

        map = L.map(mapContainer.current!, {
          center,
          zoom,
          minZoom: 11,
          zoomControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        stops.forEach((stop) => {
          if (!stop.latitude || !stop.longitude) return;
          const icon = L.divIcon({
            html: pinElement(stop.status, stop.stopOrder),
            className: "",
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });
          L.marker([stop.latitude, stop.longitude], { icon }).addTo(map);
        });

        const handle = window.setTimeout(() => map.invalidateSize(), 100);
        return () => window.clearTimeout(handle);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [stops]);

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
        <p className="text-sm text-slate-500">Map failed to load</p>
      </div>
    );
  }

  return <div ref={mapContainer} className="h-64 w-full rounded-xl border border-slate-200" />;
}
