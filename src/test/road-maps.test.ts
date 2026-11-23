import { describe, expect, it } from "vitest";
import { directionsEmbed, directionsLink, canEmbedMaps } from "../lib/road-maps";

describe("road directions", () => {
  it("uses the traveler's origin, destination and transport mode", () => {
    const url = new URL(directionsLink("Bengaluru", "Mysuru", "transit"));
    expect(url.searchParams.get("origin")).toBe("Bengaluru");
    expect(url.searchParams.get("destination")).toBe("Mysuru");
    expect(url.searchParams.get("travelmode")).toBe("transit");
  });
  it("does not build an embed for empty addresses", () => {
    expect(directionsEmbed("public-browser-key", "", "Mysuru", "driving")).toBeNull();
  });
  it("does not expose credential-bearing preview hostnames to Google", () => {
    expect(canEmbedMaps("project-devserver-secret.lovableproject.com")).toBe(false);
    expect(canEmbedMaps("tripsync.lovable.app")).toBe(true);
  });
});
