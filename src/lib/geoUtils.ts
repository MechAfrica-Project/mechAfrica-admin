// =============================================================================
// Geographic Utilities for MechAfrica Maps
// Provides region-to-coordinate mapping and map marker types
// =============================================================================

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MapMarkerData {
    id: string;
    type: "farmer" | "service_provider";
    position: { lat: number; lng: number };
    name: string;
    region: string;
    district: string;
    phone: string;
    // Farmer-specific
    crops?: string[];
    farmSize?: number;
    // Provider-specific
    services?: string[];
}

// ─── Ghana Regions → Coordinates ────────────────────────────────────────────

export const GHANA_REGIONS: Record<string, { lat: number; lng: number }> = {
    "Greater Accra": { lat: 5.6037, lng: -0.187 },
    Ashanti: { lat: 6.747, lng: -1.5209 },
    Western: { lat: 5.5, lng: -2.5 },
    "Western North": { lat: 6.2, lng: -2.4 },
    Central: { lat: 5.5, lng: -1.0 },
    Volta: { lat: 6.5, lng: 0.5 },
    Eastern: { lat: 6.5, lng: -0.5 },
    Northern: { lat: 9.5, lng: -1.0 },
    "North East": { lat: 10.2, lng: -0.2 },
    Savannah: { lat: 9.0, lng: -1.8 },
    "Upper East": { lat: 10.5, lng: -0.5 },
    "Upper West": { lat: 10.5, lng: -2.5 },
    "Bono East": { lat: 7.7, lng: -1.1 },
    Bono: { lat: 7.5, lng: -2.3 },
    "Brong-Ahafo": { lat: 7.5, lng: -1.5 },
    Ahafo: { lat: 7.0, lng: -2.3 },
    Oti: { lat: 7.8, lng: 0.3 },
};

// ─── Coordinate Resolver ────────────────────────────────────────────────────

/**
 * Resolves a region name to coordinates.
 * Applies deterministic jitter based on the provided seed (user id)
 * so that markers from the same region don't stack on top of each other,
 * but the same user always lands in the same spot.
 */
export function regionToCoordinates(
    regionName: string,
    seed: string = ""
): { lat: number; lng: number } {
    // Fallback: center of Ghana
    const GHANA_CENTER = { lat: 7.9465, lng: -1.0232 };

    if (!regionName || !regionName.trim()) {
        return addJitter(GHANA_CENTER, seed);
    }

    // Exact match
    const exact = GHANA_REGIONS[regionName];
    if (exact) return addJitter(exact, seed);

    // Fuzzy: case-insensitive partial match
    const lower = regionName.toLowerCase().trim();
    for (const [key, coords] of Object.entries(GHANA_REGIONS)) {
        if (
            key.toLowerCase() === lower ||
            key.toLowerCase().includes(lower) ||
            lower.includes(key.toLowerCase())
        ) {
            return addJitter(coords, seed);
        }
    }

    // No match — place at Ghana center
    return addJitter(GHANA_CENTER, seed);
}

/**
 * Deterministic pseudo-random jitter based on a seed string.
 * Offsets by ~0.01–0.05 degrees (~1–5 km) so markers don't overlap.
 */
function addJitter(
    base: { lat: number; lng: number },
    seed: string
): { lat: number; lng: number } {
    if (!seed) return base;

    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }

    // Generate two pseudo-random offsets in range [-0.05, 0.05]
    const latOffset = ((hash % 100) / 100) * 0.1 - 0.05;
    const lngOffset = (((hash >> 8) % 100) / 100) * 0.1 - 0.05;

    return {
        lat: base.lat + latOffset,
        lng: base.lng + lngOffset,
    };
}
