/**
 * Offline Sync and Photo Watermarking Utilities for Driver Mobile Operations
 */

export interface QueuedPickupAction {
  id: string;
  stopId: string;
  status: "COMPLETED" | "MISSED";
  note?: string;
  latitude?: number;
  longitude?: number;
  timestamp: number;
}

const STORAGE_KEY = "wastepickup_offline_queue";

/**
 * Enqueues a pickup action when the driver has no cellular data connection
 */
export function enqueueOfflineAction(action: Omit<QueuedPickupAction, "id" | "timestamp">) {
  if (typeof window === "undefined") return;

  const queue = getOfflineQueue();
  const item: QueuedPickupAction = {
    ...action,
    id: `offline_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };

  queue.push(item);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return item;
}

/**
 * Retrieves all pending offline actions waiting to sync
 */
export function getOfflineQueue(): QueuedPickupAction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Clears synced actions from the offline queue
 */
export function removeOfflineAction(id: string) {
  if (typeof window === "undefined") return;
  const queue = getOfflineQueue().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

/**
 * Watermarks a captured photo with GPS coordinates, address, and timestamp directly onto canvas.
 * This guarantees indisputable proof of service for dispute resolution.
 */
export async function watermarkProofPhoto(
  file: File,
  metadata: {
    address: string;
    latitude?: number | null;
    longitude?: number | null;
    driverName?: string;
  }
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(file);
        return;
      }

      // Draw original photo
      ctx.drawImage(img, 0, 0);

      // Draw semi-transparent watermark banner at bottom
      const bannerHeight = Math.max(60, Math.floor(img.height * 0.1));
      ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
      ctx.fillRect(0, img.height - bannerHeight, img.width, bannerHeight);

      // Draw watermark text
      const fontSize = Math.max(16, Math.floor(bannerHeight * 0.28));
      ctx.font = `600 ${fontSize}px sans-serif`;
      ctx.fillStyle = "#ffffff";

      const now = new Date().toLocaleString("en-NG", { timeZone: "Africa/Lagos" });
      const line1 = `📍 ${metadata.address} | ${now} WAT`;
      const coords = metadata.latitude && metadata.longitude
        ? `GPS: ${metadata.latitude.toFixed(5)}, ${metadata.longitude.toFixed(5)}`
        : "GPS: Not Available";
      const line2 = `${coords} | Driver: ${metadata.driverName || "Assigned Driver"}`;

      ctx.fillText(line1, 20, img.height - bannerHeight + fontSize + 8);
      ctx.fillText(line2, 20, img.height - 14);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else resolve(file);
        },
        "image/jpeg",
        0.88
      );
    };

    img.onerror = () => reject(new Error("Failed to load image for watermarking"));
    img.src = url;
  });
}

