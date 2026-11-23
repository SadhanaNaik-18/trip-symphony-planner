import { useEffect, useState } from "react";
import { Car, Footprints, Bike, TrainFront, ExternalLink, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canEmbedMaps, directionsEmbed, directionsLink, type RoadMode } from "@/lib/road-maps";
import type { TripInput, TripResult } from "@/lib/trip-types";

const MODES = [
  { value: "driving", label: "Driving", Icon: Car },
  { value: "walking", label: "Walking", Icon: Footprints },
  { value: "bicycling", label: "Cycling", Icon: Bike },
  { value: "transit", label: "Public transport", Icon: TrainFront },
] as const;

export function RoadMap({ input, result }: { input: TripInput; result: TripResult | null }) {
  const [mode, setMode] = useState<RoadMode>("driving");
  const [leg, setLeg] = useState("trip");
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const route = result?.itinerary.route ?? [];
  const selected = leg === "trip" ? undefined : route[Number(leg)];
  const origin = selected?.from ?? input.origin;
  const destination = selected?.to ?? input.destination;
  const key = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] ?? "";
  const embed = allowed ? directionsEmbed(key, origin, destination, mode) : null;
  useEffect(() => {
    setAllowed(canEmbedMaps(window.location.hostname));
  }, []);
  useEffect(() => {
    setLeg("trip");
  }, [result]);
  useEffect(() => {
    setLoading(true);
  }, [embed]);

  return (
    <section id="road-maps" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Road maps</h2>
          <p className="mt-1 text-sm text-muted-foreground break-words">
            {origin || "Origin"} → {destination || "Destination"}
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={directionsLink(origin, destination, mode)} target="_blank" rel="noreferrer">
            <ExternalLink />
            Open in Google Maps
          </a>
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Travel mode">
          {MODES.map(({ value, label, Icon }) => (
            <Button
              key={value}
              size="sm"
              variant={mode === value ? "default" : "outline"}
              aria-pressed={mode === value}
              onClick={() => setMode(value)}
            >
              <Icon />
              {label}
            </Button>
          ))}
        </div>
        {route.length > 0 && (
          <label className="flex min-w-0 items-center gap-2 text-sm">
            Route
            <select
              aria-label="Map route"
              value={leg}
              onChange={(e) => setLeg(e.target.value)}
              className="max-w-full min-w-0 rounded-md border bg-card p-2"
            >
              <option value="trip">Origin to destination</option>
              {route.map((r, i) => (
                <option key={i} value={i}>
                  {r.from} → {r.to}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="relative h-96 overflow-hidden rounded-lg border bg-muted">
        {embed ? (
          <>
            <iframe
              key={embed}
              title={`Road map from ${origin} to ${destination}`}
              src={embed}
              className="h-full w-full border-0"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => setLoading(false)}
            />
            {loading && (
              <p
                className="pointer-events-none absolute left-4 top-4 rounded-md bg-card px-3 py-2 text-sm"
                role="status"
              >
                Loading road map…
              </p>
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <MapPinned className="size-10 text-primary" />
            <p className="text-sm text-muted-foreground">
              {!origin.trim() || !destination.trim()
                ? "Enter an origin and destination to view your route."
                : !key
                  ? "Google Maps connection is not available."
                  : "The embedded map is available on your published Lovable website."}
            </p>
            <Button asChild>
              <a href={directionsLink(origin, destination, mode)} target="_blank" rel="noreferrer">
                View road directions <ExternalLink />
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
