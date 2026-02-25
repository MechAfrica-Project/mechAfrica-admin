"use client";

import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { MapMarkerData, regionToCoordinates } from "@/lib/geoUtils";
import { api } from "@/lib/api";
import type { FrontendContact } from "@/lib/api";

// ─── Config ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 100;
const CONCURRENCY = 10; // Fetch up to 10 pages in parallel

// ─── Transform contact → marker ────────────────────────────────────────────

function contactToMarker(
  contact: FrontendContact,
  type: "farmer" | "service_provider"
): MapMarkerData {
  return {
    id: contact.id,
    type,
    position: regionToCoordinates(contact.region, contact.id),
    name: `${contact.firstName} ${contact.otherNames}`.trim(),
    region: contact.region || "Unknown",
    district: contact.district || "",
    phone: contact.phone,
    ...(type === "farmer" && {
      crops: contact.crops ?? [],
      farmSize: contact.farmSize ?? 0,
    }),
    ...(type === "service_provider" && {
      services: contact.services ?? [],
    }),
  };
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMapData() {
  const statistics = useDashboardStore((state) => state.statistics);
  const dashboardLoading = useDashboardStore((state) => state.isLoading);
  const dashboardError = useDashboardStore((state) => state.error);
  const fetchDashboard = useDashboardStore((state) => state.fetchDashboard);

  const [farmerMarkers, setFarmerMarkers] = useState<MapMarkerData[]>([]);
  const [providerMarkers, setProviderMarkers] = useState<MapMarkerData[]>([]);
  const [totalFarmers, setTotalFarmers] = useState(0);
  const [totalProviders, setTotalProviders] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const hasFetched = useRef(false);
  const abortRef = useRef(false);

  // ── Parallel paginated fetcher ─────────────────────────────────────────
  // 1. Fetch page 1 to get totalPages
  // 2. Fire off remaining pages in parallel batches of CONCURRENCY
  // 3. Update state after EACH batch → progressive rendering
  const fetchProgressively = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    abortRef.current = false;

    setFarmerMarkers([]);
    setProviderMarkers([]);

    const fetchRole = async (
      role: "farmer" | "service_provider",
      fetchFn: (p: number, l: number) => ReturnType<typeof api.getFarmers>,
      onChunk: (newMarkers: MapMarkerData[]) => void,
      onTotal: (total: number) => void
    ) => {
      try {
        // Step 1: Fetch page 1 to discover totalPages
        const firstResponse = await fetchFn(1, PAGE_SIZE);
        if (!firstResponse.success || !firstResponse.data.length) return;

        const total = firstResponse.pagination?.total ?? 0;
        const totalPages = firstResponse.pagination?.totalPages ?? 1;
        onTotal(total);

        // Render first batch immediately
        const firstChunk = firstResponse.data.map((c) => contactToMarker(c, role));
        onChunk(firstChunk);

        if (totalPages <= 1 || abortRef.current) return;

        // Step 2: Build list of remaining pages
        const remainingPages = Array.from(
          { length: totalPages - 1 },
          (_, i) => i + 2
        );

        // Step 3: Fetch in parallel batches of CONCURRENCY
        for (let i = 0; i < remainingPages.length; i += CONCURRENCY) {
          if (abortRef.current) break;

          const batch = remainingPages.slice(i, i + CONCURRENCY);

          const results = await Promise.allSettled(
            batch.map((page) => fetchFn(page, PAGE_SIZE))
          );

          // Collect all successful results from this batch
          const batchMarkers: MapMarkerData[] = [];
          for (const result of results) {
            if (result.status === "fulfilled" && result.value.success) {
              const markers = result.value.data.map((c) =>
                contactToMarker(c, role)
              );
              batchMarkers.push(...markers);
            }
          }

          // Update state once per batch → triggers one re-render per batch
          if (batchMarkers.length > 0) {
            onChunk(batchMarkers);
          }
        }
      } catch (err) {
        console.error(`[MapData] Error fetching ${role}:`, err);
      }
    };

    // Fetch farmers and providers in parallel
    await Promise.all([
      fetchRole(
        "farmer",
        (p, l) => api.getFarmers(p, l),
        (chunk) => setFarmerMarkers((prev) => [...prev, ...chunk]),
        (total) => setTotalFarmers(total)
      ),
      fetchRole(
        "service_provider",
        (p, l) => api.getServiceProviders(p, l),
        (chunk) => setProviderMarkers((prev) => [...prev, ...chunk]),
        (total) => setTotalProviders(total)
      ),
    ]);

    setIsFetching(false);
    console.log("[MapData] ─── Fetch complete ───");
  }, [isFetching]);

  // Initial fetch
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      fetchDashboard();
      fetchProgressively();
    }
  }, [fetchDashboard, fetchProgressively]);

  // Combined markers
  const markers = useMemo<MapMarkerData[]>(
    () => [...farmerMarkers, ...providerMarkers],
    [farmerMarkers, providerMarkers]
  );

  const loading = dashboardLoading || isFetching;

  const refreshData = useCallback(async () => {
    hasFetched.current = false;
    abortRef.current = true;
    await fetchDashboard();
    await fetchProgressively();
  }, [fetchDashboard, fetchProgressively]);

  return {
    markers,
    statistics,
    loading,
    error: dashboardError,
    refreshData,
    totalFarmers,
    totalProviders,
  };
}
