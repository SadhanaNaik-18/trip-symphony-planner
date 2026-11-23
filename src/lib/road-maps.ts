export type RoadMode = "driving" | "walking" | "bicycling" | "transit";

export function directionsLink(origin: string, destination: string, mode: RoadMode) {
  const params = new URLSearchParams({ api: "1", origin, destination, travelmode: mode });
  return `https://www.google.com/maps/dir/?${params}`;
}

export function directionsEmbed(key: string, origin: string, destination: string, mode: RoadMode) {
  if (!key || !origin.trim() || !destination.trim()) return null;
  const params = new URLSearchParams({ key, origin, destination, mode });
  return `https://www.google.com/maps/embed/v1/directions?${params}`;
}

export function canEmbedMaps(hostname: string) {
  return (
    !hostname.includes("-devserver-") &&
    (hostname.endsWith(".lovable.app") || hostname.endsWith(".lovableproject.com"))
  );
}
