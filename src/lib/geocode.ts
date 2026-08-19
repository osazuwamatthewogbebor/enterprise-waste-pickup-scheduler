export interface Coordinates {
  latitude: number;
  longitude: number;
}

async function nominatimQuery(address: string): Promise<Coordinates | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
      next: { revalidate: 0 },
      headers: { "User-Agent": "waste-pickup-scheduler/1.0 (dev)" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat?: string; lon?: string }>;
    const first = data?.[0];
    if (!first || !first.lat || !first.lon) return null;
    return { latitude: parseFloat(first.lat), longitude: parseFloat(first.lon) };
  } catch {
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!address || address === "Unknown address") return null;

  const attempts: string[] = [address, `${address}, Nigeria`];
  const stripped = address.replace(/^((plot|no\.?)\s+\d+\s+)/i, "").trim();
  if (stripped && stripped !== address) attempts.push(`${stripped}, Nigeria`);

  for (const q of attempts) {
    const coords = await nominatimQuery(q);
    if (coords) return coords;
  }
  return null;
}
