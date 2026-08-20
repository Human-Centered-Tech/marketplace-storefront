// Service-area summary for listings with no physical pin (mon-listing-map-missing
// follow-up, 8/14): nationwide/online businesses carry only serviced_states in
// their address JSON — no coords, so the map correctly doesn't render, but the
// page showed nothing at all where paying Featured members expect presence.
// Data shapes seen on prod: "AL,AK,..." and "AL , AK , ..." (spaces), plus an
// occasional freeform service_area ("USA").

const US_STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
]);

export function serviceAreaSummary(address: unknown): string | null {
  const a = address as
    | { serviced_states?: unknown; service_area?: unknown }
    | null
    | undefined;

  const raw = a?.serviced_states;
  if (typeof raw === "string" && raw.trim()) {
    const codes = Array.from(
      new Set(
        raw
          .split(",")
          .map((s) => s.trim().toUpperCase())
          .filter((c) => US_STATES.has(c))
      )
    );
    if (codes.length >= 50) return "Serves all 50 states";
    if (codes.length > 10) return `Serves ${codes.length} states`;
    if (codes.length > 1)
      return `Serves ${codes.length} states: ${codes.join(", ")}`;
    if (codes.length === 1) return `Serves ${codes[0]}`;
  }

  const area = a?.service_area;
  if (typeof area === "string" && area.trim()) {
    return `Service area: ${area.trim()}`;
  }
  return null;
}
