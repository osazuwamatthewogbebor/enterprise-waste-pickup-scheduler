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

export function DriverMap({ stops }: { stops: Stop[] }) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      return;
    }

    import("mapbox-gl")
      .then((mod) => {
        mod.default.accessToken = token;
        const mapInstance = new mod.default.Map({
          container: mapContainer.current!,
          style: "mapbox://styles/mapbox/light-v11",
          center: [3.3792, 6.5244],
          zoom: 11,
        });

        mapInstance.on("load", () => {
          setMap(mapInstance);
          setMapLoaded(true);
        });
      })
      .catch(() => {
        console.warn("Mapbox GL failed to load");
      });
  }, []);

  useEffect(() => {
    if (!map || !mapLoaded || stops.length === 0) return;

    const colors: Record<StopStatus, string> = {
      PENDING: "#3b82f6",
      COMPLETED: "#059669",
      MISSED: "#dc2626",
    };

    stops.forEach((stop) => {
      const el = document.createElement("div");
      el.className = "map-pin";
      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        background: ${colors[stop.status]};
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
      el.innerHTML = `<span style="transform: rotate(45deg)">${stop.stopOrder}</span>`;

      if (stop.latitude && stop.longitude) {
        new (map as any).Marker({ element: el })
          .setLngLat([stop.longitude, stop.latitude])
          .addTo(map);
      }
    });
  }, [map, mapLoaded, stops]);

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50">
        <p className="text-sm text-slate-500">Map unavailable (no Mapbox token configured)</p>
      </div>
    );
  }

  return <div ref={mapContainer} className="h-64 w-full rounded-xl border border-slate-200" />;
}
